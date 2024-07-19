using System.Diagnostics;
using aspBuild.ApiCalls;

namespace aspBuild.Data
{
    public class UpdateDatabase
    {   
        // locations of each file used in the update database
        private readonly string jsonTaxiPath = "DataFiles/taxi_busyness_ranking.json";
        private readonly string jsonSubwayPath = "DataFiles/subway_busyness_ranking.json";

        // format each dataset will be saved in
        Dictionary<string, int> jsonDataTaxi;
        Dictionary<string, int> jsonDataSubway;

        private readonly Neo4jService _neo4jService;
        private readonly ModelAPI _modelAPI;
        private readonly RunningGraphAPI _runningGraphAPI;

        public UpdateDatabase(Neo4jService neo4jService, ModelAPI modelAPI, RunningGraphAPI runningGraphAPI)
        {
            _neo4jService = neo4jService;
            _modelAPI = modelAPI;
            _runningGraphAPI = runningGraphAPI;
            jsonDataSubway = [];
            jsonDataTaxi = [];
        }

        // Uses the Park, Subway and Taxi data to update the quietscores and add them to the database.
        public async Task RunUpdate()
        {
            Stopwatch stopwatch = Stopwatch.StartNew();

            await _modelAPI.UpdateDataFiles();
            
            jsonDataTaxi = GetJSONs.GetJSON(jsonTaxiPath, "taxi");
            jsonDataSubway = GetJSONs.GetJSON(jsonSubwayPath, "metro");

            await _neo4jService.PreRunQueries();

            Console.WriteLine("In function");

            // loops through the taxi keys - starting a loop by the zone its in
            foreach (var key in jsonDataTaxi.Keys)
            {
                int tempTaxi = jsonDataTaxi[key];

                // calls all the data from the Taxi zone - checking each node and relationship for that zone
                var result = await _neo4jService.GetNodeInfoForUpdate(key);
                // loops through the result, calculating and updating the quietscore on each loop
                foreach (var item in result)
                {
                    var tempQuietScore = CalculateQuietScore(item.RelatedNodeMetroZone, item.RelatedNodeRoadRank, tempTaxi, item.RelatedNodePark, item.RelatedNodeThreeOneOne, item.Distance);
                    await _neo4jService.UpdateNodeRelationship(item.NodeID, item.RelatedNodeID, tempQuietScore, key).ConfigureAwait(false);
                }
            }
            stopwatch.Stop();
            //report time taken for update
            double elapsedMinutes = (stopwatch.ElapsedMilliseconds / 1000.0) / 60.0;
            Console.WriteLine($"Elapsed Time: {elapsedMinutes} minutes");

            await _runningGraphAPI.ApiCallAsync();
        }


        // Calculates the quietscore and multiplies it by the distance.
        private double CalculateQuietScore(int metro, int road, int taxi, bool park, bool threeOneOne, double distance)
        {
            if (threeOneOne) { return 1000 * distance; }
            if (park) { return 0.25 * distance; }
            if (metro == -1) { return (road + taxi) / 2 * distance; }
            return (jsonDataSubway[metro] + road + taxi) / 3 * distance; 
        }
    }
}