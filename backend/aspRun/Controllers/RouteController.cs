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
        [Route("{PointArr}/{Quiet}")]
        public async Task<IActionResult> GetRoutes([FromRoute] float[][] PointArr, bool Quiet)
        {
            try
            {
                var result = await _neo4jService.ReadAsync(async queryRunner =>
                {
                    var query = "";
                    var queryResult = await queryRunner.RunAsync(query);
                    await queryResult.SingleAsync();//??????
                    return true;
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
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while connecting to the Neo4j database.");
            }
        }
    }
}