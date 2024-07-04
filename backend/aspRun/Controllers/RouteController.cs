using System;
using Microsoft.AspNetCore.Mvc;
using aspRun.Data;
using Neo4j.Driver;
using aspRun.ApiCalls;


namespace aspRun.Controllers
{
    [Route("api")]
    [ApiController]
    public class RouteController(Neo4jService neo4jService, WeatherAPI weatherAPI) : Controller
    {
        private readonly Neo4jService _neo4jService = neo4jService;
        private readonly WeatherAPI _weatherAPI = weatherAPI;

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

        [HttpGet("weather")]
        public Task<IActionResult> WeatherResult()
        {
            var weather = _weatherAPI.WeatherResult();
            return Task.FromResult<IActionResult>(Ok(weather));
        }
    }
}