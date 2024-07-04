using System;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace aspBuild.Data
{
    public class Neo4jService
    {
        private readonly IDriver _driver;
        private readonly string _database = "testdatabase";

        public Neo4jService(IOptions<Neo4jOptions> options)
        {
            var neo4jOptions = options.Value;
            _driver = GraphDatabase.Driver(neo4jOptions.Uri, AuthTokens.Basic(neo4jOptions.Username, neo4jOptions.Password));
        }

        public async Task UpdateNodeRelationship(int NodeIDA, int NodeIDB, int quietscore)
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


    }
}