using Neo4j.Driver;
using System.IO;


public class Neo4jImplementation : IDisposable
{
    private readonly IDriver _driver;

    // Used for checking how many nodes / relationships were successfully added 
    public int Success = 0;
    public int Failed = 0;
    public int RelSuccess { get; private set; } = 0;
    public int RelFailed { get; private set; } = 0;

    string Database = "neo4j";

    public Neo4jImplementation(string uri, string user, string password)
    {
        _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(user, password));
    }

    /// <summary>
    /// Adds a given node to the Neo4j Database.
    /// </summary>
    /// <param name="node">MapNode</param>
    /// <returns>Void</returns>
    public async Task AddNodeToDB(MapNode node)
    {
        var query = @"
        MERGE (n:nodes {nodeid: $ID})
        ON CREATE SET 
            n.longitude = $longitude, 
            n.latitude = $latitude, 
            n.taxizone = $taxizone,
            n.metrozone = $metrozone,
            n.roadrank = $roadrank,
            n.park = $park,
            n.threeoneone = $threeoneone
        ON MATCH
            SET 
                n.longitude = CASE WHEN n.longitude = 0 THEN $longitude ELSE n.longitude END,
                n.latitude = CASE WHEN n.latitude = 0 THEN $latitude ELSE n.latitude END,
                n.taxizone = $taxizone,
                n.metrozone = $metrozone,
                n.roadrank = $roadrank,
                n.park = $park,
                n.threeoneone = $threeoneone
        RETURN n;";

        var parameters = new Dictionary<string, object>
        {
            {"ID", node.ID},
            {"latitude", node.Latitude},
            {"longitude", node.Longitude},
            {"taxizone", node.TaxiZone},
            {"metrozone", node.MetroZones},
            {"roadrank", node.RoadRank},
            {"park", node.Park},
            {"threeoneone", node.ThreeOneOne}
        };

        string currentDirectory = Directory.GetCurrentDirectory();
        string relativeFilePath = Path.Combine(currentDirectory, "ErrorsNodes.txt");

        try
        {
            await using var session = _driver.AsyncSession(o => o.WithDatabase(Database));

            var result = await session.ExecuteWriteAsync(
                async tx =>
            {
                var cursor = await tx.RunAsync(query, parameters);
                var record = await cursor.SingleAsync();
                return await cursor.ToListAsync();
            });

            Success += 1;
        }
        catch (Exception ex)
        {
            using (StreamWriter writer = new StreamWriter(relativeFilePath, append:true))
            {
               writer.WriteLine($"\nNode: {node.ID} had error {ex.ToString()}");
            } 
            Failed += 1;
        }
    }

    /// <summary>
    /// Used to add nodes to the database
    /// </summary>
    /// <param name="node"></param>
    /// <param name="neighbor"></param>
    /// <returns></returns>
    public async Task AddNodeRelationships(MapNode node, MapNode neighbor)
    {
        var query = @"
        MATCH (a:nodes {nodeid: $ID1}), (b:nodes {nodeid: $ID2})
        MERGE (a)-[r1:PATH]->(b)
        ON CREATE SET r1.distance = $distance, r1.quietscore = $quietscore
        RETURN a, b, r1";

        NodeInfo nodeInfo = (NodeInfo)node.verticesInfo[neighbor.ID];

        var parameters = new Dictionary<string, object>
        {
            {"ID1", node.ID},
            {"ID2", neighbor.ID},
            {"distance", nodeInfo.Distance},
            {"quietscore", nodeInfo.QuietScore}
        };


        string currentDirectory = Directory.GetCurrentDirectory();
        string relativeFilePath = Path.Combine(currentDirectory, "ErrorsRelationship.txt");

        try
        {
            await using var session = _driver.AsyncSession(o => o.WithDatabase(Database));

            var result = await session.ExecuteWriteAsync(
                async tx =>
            {
                var cursor = await tx.RunAsync(query, parameters);
                var record = await cursor.SingleAsync();
                return await cursor.ToListAsync();
            });

        }
        catch (Exception ex)
        {
            using (StreamWriter writer = new StreamWriter(relativeFilePath, append: true))
            {
               writer.WriteLine($"\nNode: {node.ID} and neighbor: {neighbor.ID} had error {ex.ToString()}");
            } 
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
            await using var session = _driver.AsyncSession(o => o.WithDatabase(Database));
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
    /// Used to find a path from a given Latitude/Longitude to another Latitude/Longitude
    /// </summary>
    /// <param name="StartLat"></param>
    /// <param name="StartLong"></param>
    /// <param name="FinishLat"></param>
    /// <param name="FinishLong"></param>
    /// <returns>string of a GeoJSON</returns>
    public async Task<string> AStar(double StartLat, double StartLong, double FinishLat, double FinishLong)
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

        var result = routeResult.First();
        var nodeNamesObjList = result["nodeNames"] as List<object>;
        var nodeLatsObjList = result["nodeLat"] as List<object>;
        var nodeLongObjList = result["nodeLong"] as List<object>;
        var nodeCostsObjList = result["costs"] as List<object>;

        List<long> nodeNames = [];
        List<double> nodeLat = [];
        List<double> nodeLong = [];
        List<double> nodeCosts = [];

        if (nodeNamesObjList != null)
        {
            nodeNames = nodeNamesObjList.OfType<long>().ToList();
            nodeLat = nodeLatsObjList.OfType<double>().ToList();
            nodeLong = nodeLongObjList.OfType<double>().ToList();
            nodeCosts = nodeCostsObjList.OfType<double>().ToList();
        }
        else
        {
            Console.WriteLine("The List conversion in AStar Neo4jImplementation was unsuccessful.");
        }

        var coordinates = nodeLong.Zip(nodeLat, (lng, lat) => new[] { lng, lat });
        string coordinatesJson = string.Join(",\n ", coordinates.Select(coord => $"[{coord[1]}, {coord[0]}]"));
        string quietScores = string.Join(", ", nodeCosts);

        return this.GeoJSON(coordinatesJson, "P2P", "false", "[]", quietScores);
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


    /// <summary>
    /// returns the closest node to the given Latitude, Longitude combination
    /// </summary>
    /// <param name="Lat"></param>
    /// <param name="Long"></param>
    /// <returns>OSM Node ID</returns>
    public async Task<long> FindNode(double Lat, double Long)
    {
        string query = @"
        WITH point({ longitude: $Long, latitude: $Lat }) AS targetPoint
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
    /// Used to update the relationship between Nodes using the quietscore parameter
    /// </summary>
    /// <param name="NodeIDA">ID of Start Node</param>
    /// <param name="NodeIDB">ID of Finish Node</param>
    /// <param name="quietscore">Quiet Score for the node</param>
    /// <returns>Void</returns> <summary
    public async Task UpdateNodeRelationship(int NodeIDA, int NodeIDB, int quietscore)
    {
        string query = @"MATCH (a:nodes{nodeid:$nodeida})-[r:PATH] -> (b:nodes{nodeid:$nodeidb}) set r.quietscore = $quietscore";

        var parameters = new Dictionary<string, object>
        {
            {"nodeida", NodeIDA},
            {"nodeidb", NodeIDB},
            {"quietscore", quietscore}
        };

        await using var session = _driver.AsyncSession(o => o.WithDatabase(Database));

            await session.ExecuteWriteAsync(
                async tx =>
            {
                await tx.RunAsync(query, parameters);
            });

    }

    public async Task CreateJSON(string query, string fileName)
    {
        var result = await this.RunQuery(query, []);
        List<int> outputList = new List<int>();

        using(StreamWriter writetext = new StreamWriter(fileName, false))
        {
            foreach (var record in result)
            {
                writetext.WriteLine(record["n.nodeid"]);
            }
        }
    }


    public async Task WriteQuery(string query, Dictionary<string, object> parameters)
    {
        await using var session = _driver.AsyncSession(o => o.WithDatabase(Database));
        await session.ExecuteWriteAsync(async tx =>
        {
            await tx.RunAsync(query, parameters);
        });
    }

    public async Task FixDistance()
    {
        string distanceQuery = @"MATCH (n:nodes)-[p:PATH]->(b:nodes)
        WHERE p.distance > 1000
        RETURN n.nodeid, b.nodeid, n.longitude, n.latitude, b.longitude, b.latitude";

        string distanceUpdate = @"
        MATCH (n:nodes{nodeid:$nodea})-[p:PATH]-(b:nodes{nodeid:$nodeb})
        SET p.distance = $dist";

        var results = await RunQuery(distanceQuery, []);

        foreach (var result in results)
        {
            var lat1 = result["n.latitude"];
            var lat2 = result["b.latitude"];
            var lon1 = result["n.longitude"];
            var lon2 = result["b.longitude"];
            var nodea = result["n.nodeid"];
            var nodeb = result["b.nodeid"];
            var tempDist = HaversineCalculator.CalculateDistance((double)lat1, (double) lon1, (double)lat2, (double)lon2);
            var roundTempDist = Math.Round(tempDist, 2);
            Console.WriteLine($"Distance = {roundTempDist}, {lat1}, {lon1}, {lat2}, {lon2}");

            Dictionary<string, object> parameter = new()
            {
                {"nodea", nodea},
                {"nodeb", nodeb},
                {"dist", roundTempDist}
            };

            await WriteQuery(distanceUpdate, parameter);
        }
    }

    public async Task deleteBadNodes() 
    {
        List<long> badNodes = new List<long>
        {
            8313261673,
            8304497436,
            3957128585,
            2714777673,
            3957128583,
            2714921369,
            3957128579,
            6415163311,
            5008036443,
            6415163315,
            2711393518,
            5035490224,
            9168415895,
            2895918400,
            3273685797,
            2711232798,
            11931861940,
            7323390480,
            7925258977,
            7924099777,
            8266104430,
            3584444476,
            5008036382,
            1805328663,
            11028158746,
            11028158747

        };
        string query = @"
        MATCH (n:nodes{nodeid :$nodeid})-[*]-(connected)
        detach delete connected, n
        ";

        foreach (var node in badNodes)
        {
            Dictionary<string, object> parameters = new()
            {
                {"nodeid", node}
            };
            await WriteQuery(query, parameters);
        }
    }

    public void Dispose()
    {
        _driver?.Dispose();
    }
}