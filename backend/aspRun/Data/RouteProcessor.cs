using Neo4j.Driver;

namespace aspRun.Data
{
    public class Route
    {
        public List<long> NodeNames { get; set; }
        public List<double> NodeLats { get; set; }
        public List<double> NodeLongs { get; set; }
        public List<double> Costs { get; set; }
        public string CoordinatesString { get; set; }
        public string CostsString { get; set; }

        public void generateCoordinatesString()
        {
            var coordinates = NodeLongs.Zip(NodeLats, (lat, lng) => new[] { lat, lng });
            CoordinatesString = string.Join(",\n ", coordinates.Select(coord => $"[{coord[0]}, {coord[1]}]"));
        }

        public void generateQuietScoresString()
        {
            CostsString = string.Join(", ", Costs);
        }
    }

    public class RouteMapper 
    {
        public Route Map(IRecord record)
        {
            return new Route
            {
                NodeNames = record["nodeNames"] as List<long>,
                NodeLats = record["nodeLat"] as List<double>,
                NodeLongs = record["nodeLong"] as List<double>,
                Costs = record["costs"] as List<double>

            };
        }
    }
}