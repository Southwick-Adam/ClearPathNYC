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
        public static Route Map(IRecord record)
        {
            var nodeNamesObjList = record["nodeNames"] as List<object>;
            var nodeLatsObjList = record["nodeLat"] as List<object>;
            var nodeLongObjList = record["nodeLong"] as List<object>;
            var nodeCostsObjList = record["costs"] as List<object>;

            return new Route
            {
                NodeNames = nodeNamesObjList?.OfType<long>().ToList() ?? new List<long>(),
                NodeLats = nodeLatsObjList?.OfType<double>().ToList() ?? new List<double>(),
                NodeLongs = nodeLongObjList?.OfType<double>().ToList() ?? new List<double>(),
                Costs = nodeCostsObjList?.OfType<double>().ToList() ?? new List<double>()
            };
        }
    }
}