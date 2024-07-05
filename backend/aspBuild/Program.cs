using System.Diagnostics;
using aspBuild.Data;

string parkFilePath = "DataFiles\\ParkNodes.txt";
ParkNodes parkNodes= new ParkNodes(parkFilePath);
    
string jsonTaxiPath = "DataFiles\\taxi_data_final.json";
var jsonDataTaxi = GetJSONs.getJSON(jsonTaxiPath);

string jsonSubwayPath = "DataFiles\\subway_data_final.json";
var jsonDataSubway = GetJSONs.getJSON(jsonSubwayPath);
Neo4jOptions neo4JOptions = new Neo4jOptions();

Neo4jService neo4JService = new Neo4jService(neo4JOptions);
await neo4JService.GetNodeInfoForUpdate(43);









// Testing efficiency between default List Contains and custom binary search
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