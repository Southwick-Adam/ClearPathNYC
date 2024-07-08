using System;
using Microsoft.AspNetCore.Mvc;
using aspRun.Data;
using Neo4j.Driver;
using System.Text;


namespace aspRun.Controllers
{
    [Route("route")]
    [ApiController]
    public class RouteController(Neo4jService neo4jService) : Controller
    {
        private readonly Neo4jService _neo4jService = neo4jService;

           // array -> start end coords, bool quiet/loud

        [HttpGet]
        [Route("{coord1}, {coord2}")]
        public async Task<string> NodeToNode([FromRoute] List<int> coord1, List<int> coord2)
        { 
            // if (coords == null || coords.Count < 2)
            // {
            //     return "Invalid coordinates list. It should contain at least two coordinate pairs.";
            // }

            var finalCoordinates = new StringBuilder();
            var finalCosts = new StringBuilder();

            try
            {
                for (var i = 1; i < coord1.Count; i++)
                {
                    var result = await _neo4jService.AStar(coord1[i-1], coord2[i-1], coord1[i], coord2[i]);
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
                return $"An error occurred while connecting to the Neo4j database: {ex.Message}";
            }

            return neo4jService.GeoJSON(finalCoordinates.ToString(), "P2P", "false", "[]", finalCosts.ToString());

        }
    }

}
