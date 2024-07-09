using System;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace aspBuild.Data
{
    public class Neo4jService : IDisposable
    {
        private readonly IDriver _driver;
        private readonly string _database = "testdatabase";
        private string uri = "bolt://localhost:7687";
        private string user = "neo4j";
        private string password = "password";

        public Neo4jService()
        {
            _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(user, password));
        }

        /// <summary>
        /// Adds the relationship to NodeA on the Path to NodeB
        /// </summary>
        /// <param name="NodeIDA"></param>
        /// <param name="NodeIDB"></param>
        /// <param name="quietscore"></param>
        /// <returns>Void</returns>
        public async Task UpdateNodeRelationship(long NodeIDA, long NodeIDB, double quietscore)
        {
            string query = @"MATCH (a:nodes{nodeid:$nodeida})-[r:PATH] -> (b:nodes{nodeid:$nodeidb}) set r.quietscore = $quietscore";

            var parameters = new Dictionary<string, object>
            {
                {"nodeida", NodeIDA},
                {"nodeidb", NodeIDB},
                {"quietscore", quietscore}
            };

            await using var session = _driver.AsyncSession(o => o.WithDatabase(_database));

            await session.ExecuteWriteAsync(
                async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
        }

        /// <summary>
        /// Runs the input query and parameter. 
        /// </summary>
        /// <param name="Query">Required</param>
        /// <param name="Params">Empty list if null</param>
        /// <returns>List of IRecords</returns>
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
        /// Queries the Neo4j database
        /// </summary>
        /// <param name="taxizone"></param>
        /// <returns>List of NodeToNode objects</returns>
        public async Task<List<NodeToNode>> GetNodeInfoForUpdate(string taxizone)
        {
            List<NodeToNode> returnList = new List<NodeToNode>();

            string query = $@"
                MATCH (n:nodes)-[r]->(relatedNode)
                WHERE n.taxizone = $taxizone
                RETURN n.nodeid, n.roadrank, n.metrozone, n.threeoneone, 
                    type(r) AS relationshipType, r.distance, r.direction, 
                    relatedNode.nodeid AS relatedNodeId, relatedNode.roadrank AS relatedNodeRoadrank, 
                    relatedNode.metrozone AS relatedNodeMetrozone, relatedNode.threeoneone AS relatedNodeThreeoneone,
                    relatedNode.park as relatedNodePark
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

        public void Dispose()
        {
            _driver?.Dispose();
        }
    }

}