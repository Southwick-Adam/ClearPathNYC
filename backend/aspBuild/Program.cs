using System.Diagnostics;
using aspBuild.Data;
using Neo4j.Driver;

List<string> prerunQueries = [];
prerunQueries.Add(@"MATCH (n:nodes)
WHERE n.metrozone = "TRAM2"
SET n.metrozone = "2"
RETURN n;");

prerunQueries.Add(@"
MATCH (n:nodes)
WHERE n.metrozone = "TRAM1"
SET n.metrozone = "1"
RETURN n;");

prerunQueries.Add(@"
CREATE CONSTRAINT nodeid_unique IF NOT EXISTS FOR (n:nodes) REQUIRE n.nodeid IS UNIQUE;");

prerunQueries.Add(@"
CREATE INDEX nodeid_taxizone_index FOR (n:nodes) ON (n.nodeid, n.taxizone);");


using (var session = driver.session())
{
    foreach (var query in queries)
    {
        try
        {
            await session.RunAsync(query);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());
        }
    }
}


// Updates and times the update function
Stopwatch stopwatch = Stopwatch.StartNew();
var updateDatabase = new UpdateDatabase();
await updateDatabase.UpdateTheDatabase();
stopwatch.Stop();
Console.WriteLine("Elapsed Time: {0} milliseconds", stopwatch.ElapsedMilliseconds);

Console.WriteLine("Completed.");

