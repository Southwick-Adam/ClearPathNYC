using System.Diagnostics;
using aspBuild.Data;
using Neo4j.Driver;

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureServices((hostContext, services) =>
            {
                services.AddHostedService<DatabaseUpdateService>();
            });
}





// // Updates and times the update function
// Stopwatch stopwatch = Stopwatch.StartNew();
// var updateDatabase = new UpdateDatabase();
// await updateDatabase.UpdateTheDatabase();
// stopwatch.Stop();
// Console.WriteLine("Elapsed Time: {0} milliseconds", stopwatch.ElapsedMilliseconds);


// Console.WriteLine("Completed.");

