using System;
using System.Text;
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
                properties: ['distance', 'quietscore', 'loudscore']
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

        /// <summary>
        /// Used for the multi point to point route finding
        /// </summary>
        /// <param name="StartLat"></param>
        /// <param name="StartLong"></param>
        /// <param name="FinishLat"></param>
        /// <param name="FinishLong"></param>
        /// <returns></returns>
        public async Task<List<List<string>>> Yens(double StartLat, double StartLong, double FinishLat, double FinishLong, bool quiet)
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

            string quietness;
            if (quiet) { quietness= "quietscore";}
            else { quietness = "loudscore";}

            var Query = $@"
            MATCH (source: nodes{{nodeid: $start}}), (target: nodes{{nodeid: $dest}})
            CALL gds.shortestPath.yens.stream('NYC1', {{
                sourceNode: source,
                targetNode: target,
                relationshipWeightProperty: '{quietness}',
                k: 2
            }})
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
                await StartGraph();
                routeResult = await this.RunQuery(Query, Params);
            }
            Console.WriteLine(routeResult);

            List<List<string>> finalList = [];
            foreach (var result in routeResult)
            {
                var route = RouteMapper.Map(result);
                route.GenerateCoordinatesString();
                if (quiet) { route.GenerateQuietScoresString(); }
                else { route.GenerateLoudScoreString(); }
                finalList.Add([route.CoordinatesString, route.CostsString]);
            }

            return finalList;
        }


        public async Task<List<string>> AStar(double StartLat, double StartLong, double FinishLat, double FinishLong, bool quiet)
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

            string quietness;
            if (quiet) { quietness= "quietscore";}
            else { quietness = "loudscore";}

            var Query = $@"
            MATCH (source: nodes{{nodeid: $start}}), (target: nodes{{nodeid: $dest}})
            CALL gds.shortestPath.astar.stream('NYC1', {{
                sourceNode: source,
                targetNode: target,
                latitudeProperty: 'latitude',
                longitudeProperty: 'longitude',
                relationshipWeightProperty: '{quietness}'
            }})
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
                await StartGraph();
                routeResult = await this.RunQuery(Query, Params);
            }

            Console.WriteLine(routeResult);
            var result = routeResult.First();

            var route = RouteMapper.Map(result);
            route.GenerateCoordinatesString();
            if (quiet) { route.GenerateQuietScoresString(); }
            else { route.GenerateLoudScoreString(); }


            return [route.CoordinatesString, route.CostsString];
        }


        // Used to return a GeoJSON format
        public string GeoJSONMulti(List<string> coordinatesList, string loopOrP2P, string isLoop, List<string> elevationsList, List<string> quietScoresList)
        {
            var features = new List<string>();
            Console.WriteLine(coordinatesList.Count);
            Console.WriteLine(quietScoresList.Count);


            for (int i = 0; i < coordinatesList.Count - 1; i++)
            {
                string coordinates = coordinatesList[i];
                string quietScore = quietScoresList[i];

                string feature = $@"
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
                        ""elevation"": [],
                        ""quietness_score"": [{quietScore}]
                    }}
                }}";

                features.Add(feature);
            }

            string featuresJson = string.Join(",", features);

            string geoJson = $@"
            {{
                ""type"": ""FeatureCollection"",
                ""features"": [
                    {featuresJson}
                ]
            }}";

            return geoJson;
        }


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

        // public async Task AddLoudScore()
        // {
        //     var query = "MATCH ()-[r:PATH]->() SET r.loudscore = -r.quietscore;";
        //     var parameters = new Dictionary<string, object>();
        //     await using var session = _driver.AsyncSession(o => o.WithDatabase(_database));

        //     await session.ExecuteWriteAsync(
        //         async tx =>
        //     {
        //         await tx.RunAsync(query, parameters);
        //     });
        //     Console.WriteLine("Loud score added");
        // }

        public async Task DisposeAsync()
        //Disposes of session
        {
            await _driver.DisposeAsync();
        }

        public async Task<string> Loop(double latitude, double longitude, double distance, bool quiet)
        {
            Random random = new();
            double totalDistance = 0;
            int attempt = 0;

            var distanceHit = false;

            var shapeSides = 10;
            double modifier = 2;

            double startDirection = random.Next(0, 360);
            double startDirectionSave = startDirection;
            double internalAngle = 360 / shapeSides;
            while (!distanceHit)
            {
                List<double> Lats = [];
                List<double> Longs = [];
                Lats.Add(latitude);
                Longs.Add(longitude);

                for (int i = 0; i < shapeSides - 1; i++)
                {
                    Console.WriteLine(startDirection);
                    var (lat1, lon1) = GeoUtils.PointInGivenDirection(latitude, longitude, distance / (shapeSides + modifier), startDirection);

                    Lats.Add(lat1);
                    Longs.Add(lon1);
                    startDirection += internalAngle;
                    startDirection %= 360;
                    latitude = lat1;
                    longitude = lon1;
                }

                Lats.Add(Lats[0]);
                Longs.Add(Longs[0]);

                for (int i = 1; i < Lats.Count; i++)
                {
                    Console.WriteLine($"{Lats[i]}, {Longs[i]}");
                }

                StringBuilder coordinates = new();
                StringBuilder quietscore = new();
                for (int i = 0; i < shapeSides; i++)
                {
                    var (coordString, quietString, dist) = await LoopRun(Lats[i], Longs[i], Lats[i + 1], Longs[i + 1], quiet);
                    coordinates.Append(coordString);
                    quietscore.Append(quietString);
                    totalDistance += dist;
                }

                Console.WriteLine($"Total Distance: {totalDistance}, attempt: {attempt}");

                if (totalDistance < (distance * 1.2) && totalDistance > (distance * .9))
                {
                    distanceHit = true;
                    return GeoJSON(coordinates.ToString(), "Loop", "true", "[]", quietscore.ToString());
                }
                else if (totalDistance > distance * 1.2) { modifier += 1.25; }
                else { modifier -= 1; }
                totalDistance = 0;
                startDirection = startDirectionSave;
                if (attempt > 10) { distanceHit = true; }
                attempt += 1;
            }

            Console.WriteLine("Failed to find loop");
            return "";
        }

        private async Task<(string coordinateString, string QuietscoreString, double totalDistance)> LoopRun(double latitude, double longitude, double finLatitude, double finLongitude, bool quiet)
        {
            var nodea = await FindNode(latitude, longitude);
            var nodeb = await FindNode(finLatitude, finLongitude);
            Console.WriteLine($"Looprun: {nodea}, {nodeb}");
            string quietness;
            if (quiet) { quietness= "quietscore";}
            else { quietness = "loudscore";}

            string astarPath = $@"
            MATCH (source:nodes{{nodeid:$nodea}}), (dest:nodes{{nodeid: $nodeb}})
            CALL gds.shortestPath.astar.stream(
                'NYC1',
                {{
                    sourceNode:source,
                    targetNode:dest,
                    relationshipWeightProperty: '{quietness}',
                    longitudeProperty: 'longitude',
                    latitudeProperty: 'latitude'
                }}
            )
            YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs, path
            RETURN
                [nodeId IN nodeIds | gds.util.asNode(nodeId).nodeid] AS nodeNames,
                [nodeId IN nodeIds | gds.util.asNode(nodeId).latitude] AS nodeLat,
                [nodeId IN nodeIds | gds.util.asNode(nodeId).longitude] AS nodeLong,
                costs
            ";

            Dictionary<string, object> parameters = new()
            {
                {"nodea", nodea},
                {"nodeb", nodeb}
            };

            var routeResult = await RunQuery(astarPath, parameters);

            var result = routeResult.First();

            var route = RouteMapper.Map(result);
            route.GenerateCoordinatesString();
            if (quiet) { route.GenerateQuietScoresString(); }
            else { route.GenerateLoudScoreString(); }

            double distance = route.totalDistance;
            Console.WriteLine($"In looprun: {distance}");

            return (route.CoordinatesString, route.CostsString, distance);
        }
    }
}