using System;
using Microsoft.AspNetCore.Mvc;
using aspRun.Data;
using Neo4j.Driver;


namespace aspRun.Controllers
{
    [Route("route")]
    [ApiController]
    public class RouteController(Neo4jService neo4jService) : Controller
    {
        private readonly Neo4jService _neo4jService = neo4jService;

        [HttpGet]
        public async Task<IActionResult> TestConnection()
        {
            var query = "RETURN 1";

            try
            {
                var result = await _neo4jService.ReadAsync(async queryRunner =>
                {
                    var queryResult = await queryRunner.RunAsync(query);
                    var records = await queryResult.ToListAsync();
                    
                    return records.Any();
                });

                if (result)
                {
                    return Ok("Successfully connected to the Neo4j database.");
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
