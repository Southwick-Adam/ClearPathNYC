using System.Diagnostics;
using aspBuild.Data;
using Neo4j.Driver;


// string parkFilePath = "DataFiles\\ParkNodes.txt";
// ParkNodes parkNodes= new ParkNodes(parkFilePath);
    
// string jsonTaxiPath = "DataFiles\\taxi_data_final.json";
// var jsonDataTaxi = GetJSONs.getJSON(jsonTaxiPath);

// string jsonSubwayPath = "DataFiles\\subway_data_final.json";
// var jsonDataSubway = GetJSONs.getJSON(jsonSubwayPath);

// Updates and times the update function
Stopwatch stopwatch = Stopwatch.StartNew();
var updateDatabase = new UpdateDatabase();
await updateDatabase.UpdateTheDatabase();
stopwatch.Stop();
Console.WriteLine("Elapsed Time: {0} milliseconds", stopwatch.ElapsedMilliseconds);


Console.WriteLine("Completed.");




// Testing efficiency between default List Contains and binary search
        // Random random = new Random();
        // Stopwatch stopwatch = new Stopwatch();
        // stopwatch.Start();
        // foreach (var item in parkNodes.ParkNodeList)
        // {
        //     parkNodes.CheckIfPark(item);
        //     parkNodes.CheckIfPark(random.NextInt64(0,10000));
        // }
        // stopwatch.Stop();
        // Console.WriteLine("Elapsed Time: {0} milliseconds", stopwatch.ElapsedMilliseconds);


        // Stopwatch newstopwatch = new Stopwatch();
        // newstopwatch.Start();
        // foreach (var item in parkNodes.ParkNodeList)
        // {
        //     parkNodes.CheckIfPark(item);
        //     parkNodes.CheckIfPark(random.NextInt64(0,10000));
        // }
        // newstopwatch.Stop();
        // Console.WriteLine("Elapsed Time: {0} milliseconds", newstopwatch.ElapsedMilliseconds);