using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using aspRun.Data;
using Neo4j.Driver;

namespace aspRun.Controllers
{
    [Route("route")]
    [ApiController]
    public class RouteController : Controller
    {
        private readonly Neo4jService _neo4jService;

        public RouteController(Neo4jService neo4jService)
        {
            _neo4jService = neo4jService;
        }

        [HttpGet]
        public async Task<IActionResult> NodeToNode([FromQuery] List<int> coord1, [FromQuery] List<int> coord2)
        {
            if (coord1 == null || coord1.Count < 2 || coord2 == null || coord2.Count < 2)
            {
                return BadRequest("Invalid coordinates list. Each list should contain at least two coordinate pairs.");
            }

            var finalCoordinates = new StringBuilder();
            var finalCosts = new StringBuilder();

            try
            {
                for (var i = 1; i < coord1.Count; i++)
                {
                    var result = await _neo4jService.AStar(coord1[i - 1], coord2[i - 1], coord1[i], coord2[i]);
                    Console.WriteLine(result[0]);
                    Console.WriteLine(result[1]);
                    if (finalCoordinates.Length > 0)
                    {
                        finalCoordinates.Append(", ");
                    }
                    finalCoordinates.Append(result[0]);

                    if (finalCosts.Length > 0)
                    {
                        finalCosts.Append(", ");
                    }
                    finalCosts.Append(result[1]);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while connecting to the Neo4j database: {ex.Message}");
            }

            var geoJson = _neo4jService.GeoJSON(finalCoordinates.ToString(), "P2P", "false", "[]", finalCosts.ToString());
            return Ok(geoJson);
        }
    }
}
