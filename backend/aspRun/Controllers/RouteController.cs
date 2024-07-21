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

        [HttpGet("multip2p")]
        public async Task<IActionResult> NodeToNode([FromQuery] List<double> coord1, [FromQuery] List<double> coord2, [FromQuery] bool quiet)
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
            for (var i = 0; i < yensAmount; i++)
            {
                finalCoordinatesStringBuilder.Add(new StringBuilder());
                finalCostsStringbuilder.Add(new StringBuilder());

            }


            try
            {
                for (var i = 1; i < coord1.Count; i++)
                {
                    List<List<string>> results;

                    if (quiet)
                    {
                        results = await _neo4jService.Yens(coord1[i - 1], coord2[i - 1], coord1[i], coord2[i]);
                    }
                    else
                    {
                        results = await _neo4jService.Yens(coord1[i - 1], coord2[i - 1], coord1[i], coord2[i]);
                    }

                    Console.WriteLine(results.Count);

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
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while connecting to the Neo4j database: {ex.Message}");
            }
            Console.WriteLine("MAde it to here");

            List<string> listCoordinates = [];
            List<string> listQuietscores = [];
            for (var i = 0; i < finalCoordinatesStringBuilder.Count; i++)
            {
                listCoordinates.Add(finalCoordinatesStringBuilder[i].ToString());
                listQuietscores.Add(finalCostsStringbuilder[i].ToString());
            }

            var geoJson = _neo4jService.GeoJSONMulti(listCoordinates, "P2P", "false", [], listQuietscores);
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
            string result;

            Console.WriteLine($"Coordinates: {longitude}, {latitude}");
            try
            {
                result = await _neo4jService.Loop(latitude, longitude, distance, quiet);                
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while connecting to the Neo4j database: {ex.Message}");
            }

            return Ok(1);
        }
    }
}

