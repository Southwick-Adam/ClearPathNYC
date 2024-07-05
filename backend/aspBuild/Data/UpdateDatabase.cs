namespace aspBuild.Data
{

    public class UpdateDatabase
    {
        private string parkFilePath = "DataFiles\\ParkNodes.txt";
        private string jsonTaxiPath = "DataFiles\\taxi_data_final.json";
        private string jsonSubwayPath = "DataFiles\\subway_data_final.json";

        ParkNodes parkNodes;
        Dictionary<string, int> jsonDataTaxi;
        Dictionary<string, int> jsonDataSubway;
        public UpdateDatabase()
        {
            parkNodes = new ParkNodes(parkFilePath);
            jsonDataTaxi = GetJSONs.getJSON(jsonTaxiPath);
            jsonDataSubway = GetJSONs.getJSON(jsonSubwayPath);
        }

        public async Task UpdateTheDatabase()
        {
            int counter = 0;
            
            Neo4jService neo4JService = new Neo4jService();
            Console.WriteLine("In function");
            foreach (var key in jsonDataTaxi.Keys)
            {
                int tempTaxi = jsonDataTaxi[key];

                var result = await neo4JService.GetNodeInfoForUpdate(key);

                foreach (var item in result)
                {
                    // Console.WriteLine("UpdateTheDatabase");
                    // Console.WriteLine($"NodeID: {item.NodeID}, Distance: {item.Distance}, Direction: {item.Direction}, " +
                    //                   $"RelatedNodeID: {item.RelatedNodeID}, RelatedNodeRoadRank: {item.RelatedNodeRoadRank}, " +
                    //                   $"RelatedNodeMetroZone: {item.RelatedNodeMetroZone}, RelatedNodeThreeOneOne: {item.RelatedNodeThreeOneOne}, " +
                    //                   $"RelatedNodePark: {item.RelatedNodePark}");
                    var tempQuietScore = CalculateQuietScore(item.RelatedNodeMetroZone, item.RelatedNodeRoadRank, tempTaxi, item.RelatedNodePark, item.RelatedNodeThreeOneOne, item.Distance);
                    await neo4JService.UpdateNodeRelationship(item.NodeID, item.RelatedNodeID, tempQuietScore);
                    counter += 1;
                }
            }


            neo4JService.Dispose();
            Console.WriteLine($"Counter: {counter}");
            Console.WriteLine("out function");

        }

        private double CalculateQuietScore(string metro, int road, int taxi, bool park, bool threeOneOne, double distance)
        {
            if (threeOneOne) { return 1000; }
            if (park) { return (jsonDataSubway[metro] + road + taxi - 10)*distance;}
            return (jsonDataSubway[metro] + road + taxi)*distance;
        }
    }
}