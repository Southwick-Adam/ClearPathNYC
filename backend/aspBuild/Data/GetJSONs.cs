using Newtonsoft.Json;

namespace aspBuild.Data 
{
    public class GetJSONs
    {
        public static Dictionary<string, int> getJSON(string jsonPath, string type)
        {
            Dictionary<string, int> dict = new Dictionary<string, int>();

            string json = File.ReadAllText(jsonPath);

            Dictionary<int,int> scoreMap = new Dictionary<int,int>()
            {
                {1,5},
                {2,4},
                {3,3},
                {4,2},
                {5,1}
            };

            if (string.Equals(type, "taxi"))
            {
                var ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectTaxi>>(json);
                dict.Add("-1", 3);
                foreach (var item in ListJSONValues)
                {
                    dict.Add(item.LocationID, scoreMap[item.busyness_rank]);
                }
            }
            if (string.Equals(type, "metro"))
            {
                var ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectMetro>>(json);
                foreach (var item in ListJSONValues)
                {
                    dict.Add(item.station_complex_id, scoreMap[item.busyness_rank]);
                }
            }
            
            return dict;
        }
    }

    public class JSONObjectTaxi 
    {
        public string LocationID { get; set; }
        public int busyness_rank { get; set; }
    }

    public class JSONObjectMetro 
    {
        public string station_complex_id { get; set; }
        public int busyness_rank { get; set; }
    }
}