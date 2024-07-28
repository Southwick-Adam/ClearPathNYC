using System.Collections;
using OsmSharp.Streams;
using System.Diagnostics;
using OsmSharp.API;
using Newtonsoft.Json;
using GeoJSON.Net.Feature;
using GeoJSON.Net.Geometry;
using NetTopologySuite.Index.HPRtree;
using GeoAPI.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite;
using System.Diagnostics.Metrics;


Stopwatch stopwatch = new Stopwatch();
stopwatch.Start();

// pathways to each file used
string filePath = @"new-york-latest.osm.pbf";
string jsonPathTaxi = "DataFiles/NYC_Taxi_Zones.geojson";
string jsonTaxi = File.ReadAllText(jsonPathTaxi);
string csvPathMetro = "DataFiles/Subway_Data_Final.csv";
string csvPedTypePath = "DataFiles/Pedestrian.csv";
string csvParksPath = "DataFiles/Manhattan_Parks_cleaned.csv";
string csvThreeOneOne = "DataFiles/high_veryhigh_data.csv";

// used in testing to initialise each zone
TaxiZones taxiZones = new TaxiZones(jsonTaxi);
MetroStops metroStops = new MetroStops(csvPathMetro);
PedestrianData pedestrianData = new PedestrianData(csvPedTypePath);
Parks parks = new Parks(csvParksPath);
ThreeOneOne threeOneOne = new ThreeOneOne(csvThreeOneOne);



// testing for each object 
Console.WriteLine($"PARK: {parks.ParkTrueFalse(40.7667251354748, -73.98021023496408)}");

int rank = pedestrianData.ClosestRoadRank(40.7667251354748, -73.98021023496408);
Console.WriteLine($"Pedestrian Rank {rank}");

var inMetroStops = metroStops.PointInCircle(40.7667251354748, -73.98021023496408);
Console.WriteLine("Metro:");
foreach (var stop in inMetroStops) Console.WriteLine(stop);
Console.WriteLine(metroStops.NearestMetroStop(40.86068142335661, -73.92249790389387));

Console.WriteLine($"Taxi: {taxiZones.PointInTaxiZone(40.7667251354748, -73.98021023496408)}");

Console.WriteLine($"ThreeOneOne: {threeOneOne.PointInCircle(40.936664988649915, -73.94333105285334)}");

CreateDatabase createDatabase = new CreateDatabase(jsonTaxi, csvPathMetro, csvPedTypePath, csvParksPath, csvThreeOneOne);

// small segment of NYC used to test the metrics on a sample area
List<double> NYCSegment = new List<double> { -73.9861, 40.7722, -73.9679, 40.7603 }; // left, top, right, bottom

// NYC split into large chunks. Used for creation of the full database.
List<List<double>> AllSegments = new List<List<double>>{
        new List<double> {-74.0200,40.7493,-74.0014,40.6996}, // 1 on map
        new List<double> {-74.0072,40.7210,-73.9828,40.7064}, // 2
        new List<double> {-73.9891,40.7196,-73.9733,40.7089}, // etc
        new List<double> {-74.0065,40.7444,-73.9692,40.7170},
        new List<double> {-74.0137, 40.7626,-73.9636,40.7421},
        new List<double> {-74.0067,40.7756,-73.9615,40.7584},
        new List<double> {-73.9659,40.7623,-73.9589,40.7480},
        new List<double> {-73.9608,40.7661,-73.9552,40.7512},
        new List<double> {-73.9685,40.7776,-73.9462,40.7621},
        new List<double> {-73.9583,40.7646,-73.9522,40.7543},
        new List<double> {-73.9558,40.7669,-73.9503,40.7567},
        new List<double> {-73.9511,40.7670,-73.9480,40.7593},
        new List<double> {-73.9493,40.7694,-73.9462,40.7617},
        new List<double> {-73.9471,40.7787,-73.9441,40.7644},
        new List<double> {-73.9481,40.7785,-73.9430,40.7657},
        new List<double> {-73.9450,40.7808,-73.9398,40.7680},
        new List<double> {-73.9979,40.7864,-73.9398,40.7709},
        new List<double> {-73.9903,40.7955,-73.9373,40.7837},
        new List<double> {-73.9826,40.8037,-73.9286,40.7924},
        new List<double> {-73.9756,40.8046,-73.9297,40.8025},
        new List<double> {-73.9756,40.8054,-73.9300,40.8039},
        new List<double> {-73.9756,40.8065,-73.9315,40.8052},
        new List<double> {-73.9725,40.8077,-73.9323,40.8061},
        new List<double> {-73.9715,40.8174,-73.9332,40.8075},
        new List<double> {-73.9663,40.8286,-73.9337,40.8165},
        new List<double> {-73.9554,40.8356,-73.9342,40.8276},
        new List<double> {-73.9505,40.8675,-73.9341,40.8350},
        new List<double> {-73.9350,40.8675,-73.9338,40.8351},
        new List<double> {-73.9350,40.8675,-73.9329,40.8367},
        new List<double> {-73.9331,40.8675,-73.9317,40.8386},
        new List<double> {-73.9319,40.8675,-73.9307,40.8405},
        new List<double> {-73.9308,40.8675,-73.9297,40.8426},
        new List<double> {-73.9299,40.8675,-73.9288,40.8447},
        new List<double> {-73.9289,40.8675,-73.9276,40.8464},
        new List<double> {-73.9277,40.8675,-73.9261,40.8482},
        new List<double> {-73.92623,40.86751,-73.92441,40.85042},
        new List<double> {-73.9245,40.8675,-73.9230,40.8528},
        new List<double> {-73.9234,40.8675,-73.9218,40.8543},
        new List<double> {-73.9220,40.8675,-73.9205,40.8560},
        new List<double> {-73.9206,40.8675,-73.9177,40.8588}, // 39
        new List<double> {-73.9179,40.8675,-73.9162,40.8605}, // continue from 40 later
        new List<double> {-73.9164,40.8675,-73.9146,40.8623},
        new List<double> {-73.91479,40.86751,-73.91236,40.86465},
        new List<double> {-73.91259,40.86751,-73.91137,40.86698},
        new List<double> {-73.9338,40.8740,-73.9114,40.8675},
        new List<double> {-73.91140,40.87350,-73.91037,40.86750},
        new List<double> {-73.9312,40.8746,-73.9123,40.8735},
        new List<double> {-73.9300,40.8757,-73.9187,40.8745},
        new List<double> {-73.9301,40.8777,-73.9215,40.8756},
        new List<double> {-73.9415,40.7921,-73.9363,40.7846},
        new List<double> {-73.9388,40.7921,-73.9334,40.7885},
        new List<double> {-73.9381,40.7985,-73.9286,40.7918}
    };

// Used to create the sample database
//await createDatabase.AddMapArea(filePath, NYCSegment);

// For creating the full database: Feeds the segments one at a time to the AddMapArea, which will add them to the database
int count = 0;
foreach (var segment in AllSegments)
{
    Console.WriteLine(count);
    await createDatabase.AddMapArea(filePath, segment); // used to add all nodes and relationships
    count += 1;
}



// // Code used to test various pieces of the MapNode
string uri = "bolt://localhost:7687";
string user = "neo4j";
string password = "password";
Neo4jImplementation driver = new Neo4jImplementation(uri, user, password);


string delNodesQuery = @"
MATCH (n:nodes)-[r:PATH]->()
WITH n, COUNT(r) AS relCount
WHERE relCount = 0
detach delete n";
string checkNodesQuery = @"
MATCH (n:nodes)-[r:PATH]->()
WITH n, COUNT(r) AS relCount
WHERE relCount = 0
return n";


// while (true)
// {
//     var result = await driver.RunQuery(checkNodesQuery, []);
//     Console.WriteLine(result);
//     if (result.Count == 0)
//     {
//         Console.WriteLine("In function");
//         break; 
//     }
//     await driver.WriteQuery(delNodesQuery);
// }

await driver.FixDistance();
await driver.deleteBadNodes();

stopwatch.Stop();
double min = stopwatch.ElapsedMilliseconds/60000;
Console.WriteLine($"Elapsed Time: {min} min");
