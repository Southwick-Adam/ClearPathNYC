using System;
using Microsoft.AspNetCore.Mvc;
using aspRun.Data;

namespace aspRun.Controllers
{
    [Route("api")]
    [ApiController]
    public class RouteController : Controller
    {
        private readonly Neo4jService _neo4jService;

        public RouteController(Neo4jService neo4jService)
        {
            _neo4jService = neo4jService;
        }


    [HttpGet]
    public async Task<IActionResult> GetRoute()
    {
        var people = await _neo4jService.ReadAsync(async queryRunner =>
        {
            var query = "MATCH (p:Person) RETURN p";
            var result = await queryRunner.RunAsync(query);
            var peopleList = new List<Person>();

            await result.ForEachAsync(record =>
            {
                peopleList.Add(new Person
                {
                    Name = record["Name"].As<string>(),
                    Age = record["Age"].As<int>()
                });
            });

            return peopleList;
        });

        return Ok(people);
    }
    }
}
