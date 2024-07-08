using System;
using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using aspRun.Data;

namespace aspRun.Controllers
{
    [Route("route")]
    [ApiController]
    public class RouteController : ControllerBase
    {
        private readonly Neo4jService _neo4jService;

        public RouteController(Neo4jService neo4jService)
        {
            _neo4jService = neo4jService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoutes()
        {
            var query = "MATCH (n) RETURN count(n) AS nodeCount";

            try
            {
                var result = await _neo4jService.ReadAsync(async queryRunner =>
                {
                    var queryResult = await queryRunner.RunAsync(query);
                    var records = await queryResult.ToListAsync();
                    var nodeCount = records.FirstOrDefault()?["nodeCount"].As<int>();
                    return nodeCount;
                });

                if (result != null)
                {
                    return Ok(result);
                }
                else
                {
                    return StatusCode(500, "Failed to execute test query.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while connecting to the Neo4j database: {ex.Message}");
            }
        }
    }
}

