using Newtonsoft.Json;

namespace aspBuild.Data 
{
    public class GetJSONs
    {
        public static Dictionary<string, int> GetJSON(string jsonPath, string type)
        {
            Dictionary<string, int> dict = [];

            string json = File.ReadAllText(jsonPath);

            if (string.Equals(type, "taxi"))
            {
                List<JSONObjectTaxi>? ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectTaxi>>(json);
                dict.Add("-1", 3);
                foreach (var item in ListJSONValues)
                {
                    if (item != null && item.LocationID != null)
                    {
                        dict.Add(item.LocationID, ScoreMap(item.Busyness_rank));
                    }
                }
            }
            if (string.Equals(type, "metro"))
            {
                List<JSONObjectMetro>? ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectMetro>>(json);
                foreach (var item in ListJSONValues)
                {
                    if (item != null && item.station_complex_id != null)
                    {
                        dict.Add(item.station_complex_id, ScoreMap(item.Busyness_rank));
                    }
                    
                }
            }
            
            return dict;
        }

        private static int ScoreMap(int n)
        {
            return 6 - n;
        }
    }

    public class JSONObjectTaxi 
    {
        public string LocationID { get; set; } = string.Empty;
        public int Busyness_rank { get; set; }
    }

    public class JSONObjectMetro 
    {
        public string station_complex_id { get; set; } = string.Empty;
        public int Busyness_rank { get; set; }
    }
}