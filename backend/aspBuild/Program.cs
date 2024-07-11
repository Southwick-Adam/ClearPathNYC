using System.Diagnostics;
using aspBuild.Data;
using Neo4j.Driver;




// Updates and times the update function
Stopwatch stopwatch = Stopwatch.StartNew();

var updateDatabase = new UpdateDatabase();
await updateDatabase.UpdateTheDatabase();
stopwatch.Stop();
Console.WriteLine("Elapsed Time: {0} milliseconds", stopwatch.ElapsedMilliseconds);

Console.WriteLine("Completed.");

