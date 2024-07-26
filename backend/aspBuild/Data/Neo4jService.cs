using System;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace aspBuild.Data
{
    public class Neo4jService
    {
        private readonly IDriver _driver;
        private readonly string _database = "neo4j";
        private readonly Neo4jOptions _neo4jOptions;

        public Neo4jService(IOptions<Neo4jOptions> options)
        {
            _neo4jOptions = options.Value;
            _driver = GraphDatabase.Driver(_neo4jOptions.Uri, AuthTokens.Basic(_neo4jOptions.Username, _neo4jOptions.Password));
        }

        // Adds the relationship to NodeA on the Path to NodeB
        public async Task UpdateNodeRelationship(long NodeIDA, long NodeIDB, double quietscore, int taxiZone, double loudscore)
        {
            string query = @"
            MATCH (a:nodes {nodeid: $nodeida, taxizone: $taxizonea})-[r:PATH]->(b:nodes {nodeid:$nodeidb})
            SET r.quietscore = $quietscore
            SET r.loudscore = $loudscore";

            var parameters = new Dictionary<string, object>
            {
                {"nodeida", NodeIDA},
                {"nodeidb", NodeIDB},
                {"quietscore", quietscore},
                {"taxizonea", taxiZone},
                {"loudscore", loudscore}
            };

            await using var session = _driver.AsyncSession(o => o.WithDatabase(_database));

            await session.ExecuteWriteAsync(
                async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
        }

        //Runs the input query and parameter. 
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


        // Queries the Neo4j database
        public async Task<List<NodeToNode>> GetNodeInfoForUpdate(int taxizone)
        {
            List<NodeToNode> returnList = new List<NodeToNode>();

            string query = $@"
                MATCH (n:nodes)-[r]->(relatedNode)
                WHERE n.taxizone = $taxizone
                RETURN n.nodeid, n.roadrank, n.metrozone, n.threeoneone, 
                    type(r) AS relationshipType, r.distance, 
                    relatedNode.nodeid AS relatedNodeId, relatedNode.roadrank AS relatedNodeRoadrank, 
                    relatedNode.metrozone AS relatedNodeMetrozone, relatedNode.threeoneone AS relatedNodeThreeoneone,
                    relatedNode.park as relatedNodePark,
                    n.park as nodePark
            ";

            var parameters = new Dictionary<string, object>
            {
                {"taxizone", taxizone}
            };

            try
            {
                var mapper = new NodeToNodeMapper();
                var result = await RunQuery(query, parameters);
                foreach (var item in result)
                {
                    returnList.Add(mapper.Map(item));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
            return returnList;
        }


        public async Task PreRunQueries()
        {
            List<string> prerunQueries = [];
            prerunQueries.Add(@"CREATE CONSTRAINT nodeid_unique IF NOT EXISTS FOR (n:nodes) REQUIRE n.nodeid IS UNIQUE;");
            prerunQueries.Add(@"CREATE INDEX nodeid_taxizone_index IF NOT EXISTS FOR (n:nodes) ON (n.nodeid, n.taxizone);");

            using (var session = _driver.AsyncSession())
            {
                foreach (var query in prerunQueries)
                {
                    try
                    {
                        await session.RunAsync(query);
                        Console.WriteLine($"Query Completed: {query}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.ToString());
                    }
                }
            }
        }
    }

}