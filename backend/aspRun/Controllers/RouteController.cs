using System.Text;
using Microsoft.AspNetCore.Mvc;
using aspRun.Data;
using System.Drawing;
using System.Diagnostics;

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


        [HttpGet("p2p")]
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
            double totalDistance = 0;

            try
            {
                for (var i = 1; i < coord1.Count; i++)
                {
                    List<string> result;

                    result = await _neo4jService.AStar(coord1[i - 1], coord2[i - 1], coord1[i], coord2[i], quiet);

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

                    totalDistance += double.Parse(result[2]);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while connecting to the Neo4j database: {ex.Message}");
            }

            var geoJson = _neo4jService.GeoJSON(finalCoordinates.ToString(), "P2P", "false", "[]", finalCosts.ToString(), totalDistance);
            return Ok(geoJson);
        }


        [HttpGet("multip2p")]
        public async Task<IActionResult> MultiNodeToNode([FromQuery] List<double> coord1, [FromQuery] List<double> coord2, [FromQuery] bool quiet)
        {
            int yensAmount = 3;
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

            List<StringBuilder> finalCoordinatesStringBuilder = [];
            List<StringBuilder> finalCostsStringbuilder = [];
            List<double> finalDistancesDouble = [];
            for (var i = 0; i < yensAmount; i++)
            {
                finalCoordinatesStringBuilder.Add(new StringBuilder());
                finalCostsStringbuilder.Add(new StringBuilder());
                finalDistancesDouble.Add(0);
            }

            try
            {
                for (var i = 1; i < coord1.Count; i++)
                {
                    List<List<string>> results;

                    results = await _neo4jService.Yens(coord1[i - 1], coord2[i - 1], coord1[i], coord2[i], quiet);

                    for (int j = 0; j < results.Count; j++)
                    {
                        if (finalCoordinatesStringBuilder[j].Length > 0)
                        {
                            finalCoordinatesStringBuilder[j].Append(", ");
                        }
                        finalCoordinatesStringBuilder[j].Append(results[j][0]);

                        if (finalCostsStringbuilder[j].Length > 0)
                        {
                            finalCostsStringbuilder[j].Append(", ");
                        }
                        finalCostsStringbuilder[j].Append(results[j][1]);
                        finalDistancesDouble[j] += Double.Parse(results[j][2]);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while connecting to the Neo4j database: {ex.Message}");
            }

            List<string> listCoordinates = [];
            List<string> listQuietscores = [];
            List<string> listDistances = [];
            for (var i = 0; i < finalCoordinatesStringBuilder.Count; i++)
            {
                listCoordinates.Add(finalCoordinatesStringBuilder[i].ToString());
                listQuietscores.Add(finalCostsStringbuilder[i].ToString());
                listDistances.Add(finalDistancesDouble[i].ToString());
            }

            var geoJson = _neo4jService.GeoJSONMulti(listCoordinates, "P2P", "false", [], listQuietscores, listDistances);
            return Ok(geoJson);
        }



        [HttpGet("loop")]
        public async Task<IActionResult> Loop([FromQuery] List<double> coordinate, [FromQuery] double distance, [FromQuery] bool quiet)
        {

            if (coordinate == null || coordinate.Count < 2)
            {
                return BadRequest("Coordinates must contain at least two elements.");
            }

            double longitude = coordinate[0];
            double latitude = coordinate[1];
            Console.WriteLine($"Coordinates: {latitude}, {longitude}");
            string result;
            try
            {
                result = await _neo4jService.Loop(latitude, longitude, distance, quiet);
                return Ok(result);
            }
            catch (Exception ex)
            {
                int attempts = 0;
                while (attempts < 3)
                {
                    try
                    {
                        result = await _neo4jService.Loop(latitude, longitude, distance, quiet);
                        return Ok(result);
                    }
                    catch
                    {
                        attempts++;
                    }
                }
                return BadRequest($"An error occurred while processing your request: {ex}");
            }
        }
    }
}

