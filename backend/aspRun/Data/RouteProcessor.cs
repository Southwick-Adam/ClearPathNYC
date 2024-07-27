using System;
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
        public double totalDistance { get; set; }

        public Route()
        {
            NodeNames = [];
            NodeLats = [];
            NodeLongs = [];
            Costs = [];
            CoordinatesString = string.Empty;
            CostsString = string.Empty;
        }

        public void GenerateCoordinatesString()
        {
            var coordinates = NodeLongs.Zip(NodeLats, (lat, lng) => new[] { lat, lng });
            CoordinatesString = string.Join(",\n ", coordinates.Select(coord => $"[{coord[0]}, {coord[1]}]"));
        }

        public void GenerateQuietScoresString()
        {
            List<double> distances = [];
            List<double> costsLocal = [];
            for (var i = 1; i < NodeLats.Count; i++)
            {
                distances.Add(HaversineCalculator.CalculateDistance(NodeLats[i-1], NodeLongs[i-1], NodeLats[i], NodeLongs[i]));
                costsLocal.Add(Costs[i]-Costs[i-1]);
            }
            
            List<double> finalQuietScore = [];
            for (var i = 0; i < distances.Count; i++)
            {
                finalQuietScore.Add(Math.Round(costsLocal[i] / distances [i]));
            }
            CostsString = string.Join(", ", finalQuietScore);
            foreach (var dist in distances)
            {
                totalDistance += dist;
            }
        }

        public void GenerateLoudScoreString()
        {
            List<double> distances = [];
            List<double> costsLocal = [];
            for (var i = 1; i < NodeLats.Count; i++)
            {
                distances.Add(HaversineCalculator.CalculateDistance(NodeLats[i-1], NodeLongs[i-1], NodeLats[i], NodeLongs[i]));
                costsLocal.Add(Costs[i]-Costs[i-1]);
            }
            
            List<double> finalLoudScore = [];
            for (var i = 0; i < distances.Count; i++)
            {
                double tempScore = Math.Round(costsLocal[i] / distances [i]);
                if (tempScore == 1000){finalLoudScore.Add(1000);}
                else if (tempScore == 0){finalLoudScore.Add(5);}
                else {finalLoudScore.Add(6- tempScore); }
            }
            CostsString = string.Join(", ", finalLoudScore);
            foreach (var dist in distances)
            {
                totalDistance += dist;
            }
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
                NodeNames = nodeNamesObjList?.OfType<long>().ToList() ?? [],
                NodeLats = nodeLatsObjList?.OfType<double>().ToList() ?? [],
                NodeLongs = nodeLongObjList?.OfType<double>().ToList() ?? [],
                Costs = nodeCostsObjList?.OfType<double>().ToList() ?? []
            };
        }
    }
}