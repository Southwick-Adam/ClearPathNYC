namespace aspBuild.Data
{

    public class UpdateDatabase
    {   
        // locations of each file used in the update database
        private string parkFilePath = "DataFiles\\ParkNodes.txt";
        private string jsonTaxiPath = "DataFiles\\taxi_busyness_ranking.json";
        private string jsonSubwayPath = "DataFiles\\subway_busyness_ranking.json";

        Dictionary<int,int> scoreMap = new Dictionary<int,int>()
            {
                // { 0, 0 },
                // {-1, 0 },
                {1,5},
                {2,4},
                {3,3},
                {4,2},
                {5,1}
            };


        // format each dataset will be saved in
        ParkNodes parkNodes;
        Dictionary<string, int> jsonDataTaxi;
        Dictionary<string, int> jsonDataSubway;

        // Constructor for UpdateDatabase
        public UpdateDatabase()
        {
            parkNodes = new ParkNodes(parkFilePath);
            jsonDataTaxi = GetJSONs.getJSON(jsonTaxiPath, "taxi");
            jsonDataSubway = GetJSONs.getJSON(jsonSubwayPath, "metro");
        }


        /// <summary>
        /// Uses the Park, Subway and Taxi data to update the quietscores and add them to the database.
        /// </summary>
        /// <returns>Void</returns>
        public async Task UpdateTheDatabase()
        {
            int counter = 0;
            
            Neo4jService neo4JService = new Neo4jService();
            Console.WriteLine("In function");

            // loops through the taxi keys - starting a loop by the zone its in
            foreach (var key in jsonDataTaxi.Keys)
            {
                Console.WriteLine($"Current Taxi Zone: {key}");
                int tempTaxi = jsonDataTaxi[key];

                // calls all the data from the Taxi zone - checking each node and relationship for that zone
                var result = await neo4JService.GetNodeInfoForUpdate(key);

                // loops through the result, calculating and updating the quietscore on each loop
                foreach (var item in result)
                {
                    var tempQuietScore = CalculateQuietScore(item.RelatedNodeMetroZone, item.RelatedNodeRoadRank, tempTaxi, item.RelatedNodePark, item.RelatedNodeThreeOneOne, item.Distance);
                    await neo4JService.UpdateNodeRelationship(item.NodeID, item.RelatedNodeID, tempQuietScore).ConfigureAwait(false);
                    counter += 1;
                }
            }

            neo4JService.Dispose();
            Console.WriteLine($"Counter: {counter}");
            Console.WriteLine("out function");

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
            try
            {
                if (threeOneOne) { return 1000; }
                if (park && string.Equals(metro, "-1")){return (scoreMap[road] + scoreMap[taxi] - 10)*distance;}
                if (park) { return (scoreMap[jsonDataSubway[metro]] + scoreMap[road] + scoreMap[taxi] - 10)*distance;}
                if (string.Equals(metro, "-1")) { return (scoreMap[road] + scoreMap[taxi])*distance;}
                return (scoreMap[jsonDataSubway[metro]] + scoreMap[road] + scoreMap[taxi])*distance;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                Console.WriteLine($"metro: {metro}, road: {road}, taxi: {taxi}, park {park}, threeOneOne: {threeOneOne}, distance: {distance}");
                
            }
            return (scoreMap[jsonDataSubway[metro]] + scoreMap[road] + scoreMap[taxi]) * distance;
            
        }
    }
}