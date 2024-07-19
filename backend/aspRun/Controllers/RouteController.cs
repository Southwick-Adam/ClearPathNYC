using System.Text;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<IActionResult> NodeToNode([FromQuery] List<double> coord1, [FromQuery] List<double> coord2, [FromQuery] bool quiet)
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


        
        // TODO: Fix routes
        [HttpGet("loop")]
        public async Task<IActionResult> Loop([FromQuery] List<double> coordinate, [FromQuery] double distance, [FromQuery] bool quiet)
        {
            Console.WriteLine($"Coordinates: {coordinate}");
            
            if (coordinate == null || coordinate.Count < 2)
            {
                return BadRequest("Coordinates must contain at least two elements.");
            }

            double longitude = coordinate[0];
            double latitude = coordinate[1];
            string result;

            try
            {
                result = await _neo4jService.Loop(latitude, longitude, distance, quiet);                
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while connecting to the Neo4j database: {ex.Message}");
            }

            return Ok(result);
        }
    }
}

