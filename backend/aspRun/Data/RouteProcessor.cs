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
            CoordinatesString = string.Join(",\n ", coordinates.Select(coord => $"[{coord[1]}, {coord[0]}]"));
        }

        public void generateQuietScoresString()
        {
            List<double> distances = new List<double>();
            List<double> costsLocal = new List<double>();
            // distances.Add(0);
            // costsLocal.Add(0);
            for (var i = 1; i < NodeLats.Count; i++)
            {
                distances.Add((HaversineCalculator.CalculateDistance(NodeLats[i-1], NodeLongs[i-1], NodeLats[i], NodeLongs[i])));
                costsLocal.Add((Costs[i]-Costs[i-1]));
            }
            
            List<double> finalQuietScore = new List<double>();
            for (var i = 0; i < distances.Count; i++)
            {
                finalQuietScore.Add(Math.Round(costsLocal[i] / (distances [i])));
            }
            CostsString = string.Join(", ", finalQuietScore);
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