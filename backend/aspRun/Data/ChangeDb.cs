using System;

namespace aspRun.Data
{
    public class ChangeDb
    {
        private readonly Neo4jService _neo4jService;

        public ChangeDb(Neo4jService neo4jService)
        {
            _neo4jService = neo4jService;
        }

        public async Task Change()
        {
            try
            {
                Console.WriteLine("Graph: start");
                await _neo4jService.CheckGraph();
                await _neo4jService.StopGraph();
                await _neo4jService.CheckGraph();
                await _neo4jService.StartGraph();
                await _neo4jService.CheckGraph();
                Console.WriteLine("Graph: success");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while executing ChangeDb: {ex.Message}");
            }
        }
    }
}
