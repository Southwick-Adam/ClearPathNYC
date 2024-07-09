using System;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace aspRun.Data
{
    public class Neo4jService
    {
        private IDriver _driver;
        private readonly Neo4jOptions _neo4jOptions;
        private readonly string _database = "neo4j";

        public Neo4jService(IOptions<Neo4jOptions> options)
        {
            _neo4jOptions = options.Value;
            _driver = GraphDatabase.Driver(_neo4jOptions.Uri_1, AuthTokens.Basic(_neo4jOptions.Username_1, _neo4jOptions.Password_1));
        }

        public void ChangeDB(bool useContainer1)
        {
            string uri;
            string username;
            string password;

            if (useContainer1)
            {
                uri = _neo4jOptions.Uri_1;
                username = _neo4jOptions.Username_1;
                password = _neo4jOptions.Password_1;
            }
            else
            {
                uri = _neo4jOptions.Uri_2;
                username = _neo4jOptions.Username_2;
                password = _neo4jOptions.Password_2;
            }
            _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
            Console.WriteLine("DB CHANGE EXECUTED");
            if (useContainer1)
            {
                Console.WriteLine("NOW USING NEO4J CONTAINER 1");
            }
            else
            {
                Console.WriteLine("NOW USING NEO4J CONTAINER 2");
            }
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

        /// <summary>
        /// Used for running queries to the Neo4j database
        /// </summary>
        /// <param name="Query"></param>
        /// <param name="Params"></param>
        /// <returns>List IRecord</returns> 
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
                return new List<IRecord>();
            }
        }


        /// <summary>
        /// returns the closest node to the given Latitude, Longitude combination
        /// </summary>
        /// <param name="Lat"></param>
        /// <param name="Long"></param>
        /// <returns>OSM Node ID</returns>
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
            {"Lat", Lat},
            {"Long", Long}
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


        /// <summary>
        /// Used to find a path from a given Latitude/Longitude to another Latitude/Longitude
        /// </summary>
        /// <param name="StartLat"></param>
        /// <param name="StartLong"></param>
        /// <param name="FinishLat"></param>
        /// <param name="FinishLong"></param>
        /// <returns>string of a GeoJSON</returns>
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
            route.generateCoordinatesString();
            route.generateQuietScoresString();

            return [route.CoordinatesString, route.CostsString];
        }


        /// <summary>
        /// Used to return a GeoJSON format
        /// </summary>
        /// <param name="coordinates"></param>
        /// <param name="loopOrP2P"></param>
        /// <param name="isLoop"></param>
        /// <param name="elevation"></param>
        /// <param name="quietScore"></param>
        /// <returns>string in the GeoJSON format</returns> 
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


        public async Task DisposeAsync()
        //Disposes of session
        {
            await _driver.DisposeAsync();
        }
    }
}