using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using aspRun.Data;

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
        public async Task<IActionResult> NodeToNode([FromQuery] List<double> coord1, [FromQuery] List<double> coord2, bool quiet)
        {
            if (coord1 == null || coord1.Count < 2 || coord2 == null || coord2.Count < 2)
            {
                return BadRequest("Invalid coordinates list. Each list should contain at least two coordinate pairs.");
            }
            foreach (var coord in coord1)
            {
                Console.WriteLine(coord);
            }
            foreach (var coord in coord2)
            {
                Console.WriteLine(coord);
            }

            var finalCoordinates = new StringBuilder();
            var finalCosts = new StringBuilder();

            try
            {
                for (var i = 1; i < coord1.Count; i++)
                {
                    List<string> result;

                    if (quiet)
                    {
                        result = await _neo4jService.AStar(coord1[i - 1], coord2[i - 1], coord1[i], coord2[i]);
                    }
                    else
                    {
                        result = await _neo4jService.AStarLoud(coord1[i - 1], coord2[i - 1], coord1[i], coord2[i]);
                    }

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

