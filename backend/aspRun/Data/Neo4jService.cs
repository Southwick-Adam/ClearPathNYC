using System;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace aspRun.Data
{
    public class Neo4jService
    {
        private IDriver _driver;
        private readonly Neo4jOptions _neo4jOptions;

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

        public async Task DisposeAsync()
        //Disposes of session
        {
            await _driver.DisposeAsync();
        }
    }
}