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
        //[Route("{PointArr}/{Quiet}")]
        public async Task<IActionResult> GetRoutes()//[FromRoute] float[][] PointArr, bool Quiet)
        {
            var query = "MATCH (p:Person) WHERE p.born < 1960 RETURN p";

            try
            {
                var result = await _neo4jService.ReadAsync(async queryRunner =>
                {
                    
                    var queryResult = await queryRunner.RunAsync(query);
                    var records = await queryResult.ToListAsync();
                    var content = string.Join("\n", records.Select(record => FormatNode(record["p"].As<INode>())));
                    return content;
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
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while connecting to the Neo4j database.");
            }
        }

        private static string FormatNode(INode node)
        {
            var properties = string.Join(", ", node.Properties.Select(kvp => $"{kvp.Key}: {kvp.Value}"));
            return $"Node(id: {node.ElementId}, labels: [{string.Join(", ", node.Labels)}], properties: {{{properties}}})";
        }
    }
}