using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ;

namespace asp_run.Controllers
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
        var people = await _neo4jService.ExecuteReadTransactionAsync(async tx =>
        {
            var query = "MATCH (p:Person) RETURN p.name AS Name, p.age AS Age";
            var result = await tx.RunAsync(query);
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
