using System;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace backend.Data
{
    public class Neo4jService
    {
        private readonly IDriver _driver;

        public Neo4jService(IOptions<Neo4jOptions> options)
        {
            var neo4jOptions = options.Value;
            _driver = GraphDatabase.Driver(neo4jOptions.Uri, AuthTokens.Basic(neo4jOptions.Username, neo4jOptions.Password));
        }

        public async Task WriteAsync(Func<IAsyncQueryRunner, Task> func)
        //handles session logic for writing info into DB
        {
            var session = _driver.AsyncSession(s => s.WithDefaultAccessMode(AccessMode.Write));
            try
            {
                await session.ExecuteWriteAsync(func);
            }
            finally
            {
                await session.CloseAsync();
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
