using System;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace aspRun.Data
{
    public class Neo4jService
    {
        private readonly IDriver _driver;
        private readonly Neo4jOptions _neo4jOptions;
        private readonly string _database = "neo4j";

        public Neo4jService(IOptions<Neo4jOptions> options)
        {
            _neo4jOptions = options.Value;
            _driver = GraphDatabase.Driver(_neo4jOptions.Uri, AuthTokens.Basic(_neo4jOptions.Username, _neo4jOptions.Password));
        }

        public async Task<T> ReadAsync<T>(Func<IAsyncQueryRunner, Task<T>> func)
        //handles session logic for reading info from DB
        {
            var session = _driver.AsyncSession(o => o.WithDefaultAccessMode(AccessMode.Read));
            try
            {
                return await session.ExecuteReadAsync(func);
            }
            finally
            {
                await session.CloseAsync();
            }
        }

        // Used for running queries to the Neo4j database
        public async Task<List<IRecord>> RunQuery(string Query, Dictionary<string, object> Params)
        {
            try
            {
                await using var session = _driver.AsyncSession(o => o.WithDatabase(_database));
                var result = await session.ExecuteReadAsync(
                    async tx =>
                {
                    var cursor = await tx.RunAsync(Query, Params);
                    return await cursor.ToListAsync();
                });
                return result;

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return [];
            }
        }


        // returns the closest node to the given Latitude, Longitude combination
        public async Task<long> FindNode(double Lat, double Long)
        {
            string query = @"
            WITH point({ latitude: $Lat, longitude: $Long }) AS targetPoint
            MATCH (n:nodes)
            WITH n, point.distance(point({ longitude: n.longitude, latitude: n.latitude }), targetPoint) AS dist
            RETURN n.nodeid, dist
            order by dist
            LIMIT 1";

            var parameters = new Dictionary<string, object>
            {
                {"Lat", Long},
                {"Long", Lat}
            };

            List<IRecord> records = await this.RunQuery(query, parameters);
            try
            {
                return (long)records.First()["n.nodeid"];
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return 0;
            }
        }

        public async Task StopGraph()
        {
            var StopGraph = @"CALL gds.graph.drop('NYC1')";
            await RunQuery(StopGraph, []);
            StopGraph = @"CALL gds.graph.drop('NYC1Loud')";
            await RunQuery(StopGraph, []);
            Console.WriteLine($"Graph stopped");
        }

        public async Task StartGraph()
        {
            var StartGraph = @"
            CALL gds.graph.project(
            'NYC1',
            {
                nodes: {
                label: 'nodes',
                properties: ['latitude', 'longitude']
                }
            },
            {
                PATH: {
                properties: ['distance', 'quietscore']
                }
            });";
            await RunQuery(StartGraph, []);

            await AddLoudScore();
            StartGraph = @"
            CALL gds.graph.project(
            'NYC1Loud',
            {
                nodes: {
                label: 'nodes',
                properties: ['latitude', 'longitude']
                }
            },
            {
                PATH: {
                properties: ['distance', 'loudscore']
                }
            });";
            await RunQuery(StartGraph, []);

            Console.WriteLine($"Graph started");
        }

        public async Task CheckGraph()
        {
            var CheckGraph = @"
            CALL gds.graph.exists('NYC1')
            YIELD exists
            RETURN exists
        ";
            var output = await RunQuery(CheckGraph, []);
            Console.WriteLine($"CheckGraph: {output.First()["exists"]}");
        }

        // Used to find a path from a given Latitude/Longitude to another Latitude/Longitude
        public async Task<List<string>> AStar(double StartLat, double StartLong, double FinishLat, double FinishLong)
        {
            long start = await this.FindNode(StartLat, StartLong);
            long destination = await this.FindNode(FinishLat, FinishLong);

            Console.WriteLine($"Start: {start}");
            Console.WriteLine($"Fin: {destination}");

            // graph is a temporary structure stored in Main Memory for faster queries
            var CheckGraph = @"
            CALL gds.graph.exists('NYC1')
            YIELD exists
            RETURN exists
        ";

            var StartGraph = @"
            CALL gds.graph.project(
            'NYC1',
            {
                nodes: {
                label: 'nodes',
                properties: ['latitude', 'longitude']
                }
            },
            {
                PATH: {
                properties: ['distance', 'quietscore']
                }
            });
        ";

            var Query = @"
            MATCH (source: nodes{nodeid: $start}), (target: nodes{nodeid: $dest})
            CALL gds.shortestPath.astar.stream('NYC1', {
                sourceNode: source,
                targetNode: target,
                latitudeProperty: 'latitude',
                longitudeProperty: 'longitude',
                relationshipWeightProperty: 'quietscore'
            })
            YIELD nodeIds, costs
            RETURN 
                [nodeId IN nodeIds | gds.util.asNode(nodeId).nodeid] AS nodeNames,
                [nodeId IN nodeIds | gds.util.asNode(nodeId).latitude] AS nodeLat,
                [nodeId IN nodeIds | gds.util.asNode(nodeId).longitude] AS nodeLong,
                costs
        ";

            var Params = new Dictionary<string, object>
        {
            {"start", start},
            {"dest", destination}
        };

            // check that the temp database is set up using CheckGraph
            var graphResult = await this.RunQuery(CheckGraph, []);
            bool graph = (bool)graphResult.First()["exists"];
            Console.WriteLine($"Graph T/F: {graph}");

            List<IRecord> routeResult;
            if (graph)
            {
                routeResult = await this.RunQuery(Query, Params);
            }
            else
            {
                await this.RunQuery(StartGraph, []);
                routeResult = await this.RunQuery(Query, Params);
            }
            Console.WriteLine(routeResult);
            var result = routeResult.First();

            var route = RouteMapper.Map(result);
            route.GenerateCoordinatesString();
            route.GenerateQuietScoresString();

            return [route.CoordinatesString, route.CostsString];
        }

        public async Task<List<string>> AStarLoud(double StartLat, double StartLong, double FinishLat, double FinishLong)
        {
            long start = await this.FindNode(StartLat, StartLong);
            long destination = await this.FindNode(FinishLat, FinishLong);

            Console.WriteLine($"Start: {start}");
            Console.WriteLine($"Fin: {destination}");

            // graph is a temporary structure stored in Main Memory for faster queries
            var CheckGraph = @"
            CALL gds.graph.exists('NYC1Loud')
            YIELD exists
            RETURN exists
        ";

            var StartGraph = @"
            CALL gds.graph.project(
            'NYC1Loud',
            {
                nodes: {
                label: 'nodes',
                properties: ['latitude', 'longitude']
                }
            },
            {
                PATH: {
                properties: ['distance', 'loudscore']
                }
            });
        ";

            var Query = @"
            MATCH (source: nodes{nodeid: $start}), (target: nodes{nodeid: $dest})
            CALL gds.shortestPath.astar.stream('NYC1', {
                sourceNode: source,
                targetNode: target,
                latitudeProperty: 'latitude',
                longitudeProperty: 'longitude',
                relationshipWeightProperty: 'distance'
            })
            YIELD nodeIds, costs
            RETURN 
                [nodeId IN nodeIds | gds.util.asNode(nodeId).nodeid] AS nodeNames,
                [nodeId IN nodeIds | gds.util.asNode(nodeId).latitude] AS nodeLat,
                [nodeId IN nodeIds | gds.util.asNode(nodeId).longitude] AS nodeLong,
                costs
        ";

            var Params = new Dictionary<string, object>
        {
            {"start", start},
            {"dest", destination}
        };

            // check that the temp database is set up using CheckGraph
            var graphResult = await this.RunQuery(CheckGraph, []);
            bool graph = (bool)graphResult.First()["exists"];
            Console.WriteLine($"Graph T/F: {graph}");

            List<IRecord> routeResult;
            if (graph)
            {
                routeResult = await this.RunQuery(Query, Params);
            }
            else
            {
                await this.RunQuery(StartGraph, []);
                routeResult = await this.RunQuery(Query, Params);
            }
            Console.WriteLine(routeResult);
            var result = routeResult.First();

            var route = RouteMapper.Map(result);
            route.GenerateCoordinatesString();
            route.GenerateQuietScoresString();

            return [route.CoordinatesString, route.CostsString];
        }

        // Used to return a GeoJSON format
        public string GeoJSON(string coordinates, string loopOrP2P, string isLoop, string elevation, string quietScore)
        {

            string GeoJSON = $@"
        {{
            ""type"": ""FeatureCollection"",
            ""features"": [
            {{
                ""type"": ""Feature"",
                ""geometry"": {{
                    ""type"": ""LineString"",
                    ""coordinates"": [
                        {coordinates}
                    ]
                }},
                ""properties"": {{
                    ""name"": ""{loopOrP2P}"",
                    ""isLoop"": {isLoop},
                    ""elevation"": [{elevation}],
                    ""quietness_score"": [{quietScore}]
                }}
            }}
            ]
        }}
        ";
            return GeoJSON;
        }

        public async Task AddLoudScore()
        {
            var query = "MATCH ()-[r:PATH]->() SET r.loudscore = -r.quietscore;";
            var parameters = new Dictionary<string, object>();
             await using var session = _driver.AsyncSession(o => o.WithDatabase(_database));

            await session.ExecuteWriteAsync(
                async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
            Console.WriteLine("Loud score added");
        }

        public async Task DisposeAsync()
        //Disposes of session
        {
            await _driver.DisposeAsync();
        }

        public async Task<string> Loop(double latitude, double longitude, double distance, bool quiet)
        {
            Random random = new();

            int startDirection = random.Next(0,360);
            




            throw new NotImplementedException();
        }
    }
}