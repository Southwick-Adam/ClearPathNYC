using System.Diagnostics;

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

        public UpdateDatabase(Neo4jService neo4jService)
        {
            _neo4jService = neo4jService;
            jsonDataSubway = [];
            jsonDataTaxi = [];
        }


        /// <summary>
        /// Uses the Park, Subway and Taxi data to update the quietscores and add them to the database.
        /// </summary>
        /// <returns>Void</returns>
        public async Task UpdateTheDatabase()
        {
            // time it
            Console.WriteLine("Update started");
            Stopwatch stopwatch = Stopwatch.StartNew();

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
            Console.WriteLine("Elapsed Time: {0} milliseconds", stopwatch.ElapsedMilliseconds);
        }


        /// <summary>
        /// Calculates the quietscore and multiplies it by the distance.
        /// </summary>
        /// <param name="metro"></param>
        /// <param name="road"></param>
        /// <param name="taxi"></param>
        /// <param name="park"></param>
        /// <param name="threeOneOne"></param>
        /// <param name="distance"></param>
        /// <returns>double</returns>
        private double CalculateQuietScore(string metro, int road, int taxi, bool park, bool threeOneOne, double distance)
        {
            if (threeOneOne) { return 5000; }
            // if (park && string.Equals(metro, "-1")) { return 0.25 * distance; }
            if (park) { return 0.25 * distance; }
            if (string.Equals(metro, "-1")) { return ((road + taxi) / 2) * distance; }
            return (((jsonDataSubway[metro] + road + taxi) / 3) * distance); 
        }
    }
}