using Newtonsoft.Json;

namespace aspBuild.Data 
{
    public class GetJSONs
    {
        public static Dictionary<string, int> getJSON(string jsonPath, string type)
        {
            Dictionary<string, int> dict = new Dictionary<string, int>();

            string json = File.ReadAllText(jsonPath);

            
            if (string.Equals(type, "taxi"))
            {
                var ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectTaxi>>(json);
                foreach (var item in ListJSONValues)
                {
                    dict.Add(item.LocationID, item.busyness_rank);
                }
            }
            if (string.Equals(type, "metro"))
            {
                var ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectMetro>>(json);
                foreach (var item in ListJSONValues)
                {
                    dict.Add(item.station_complex_id, item.busyness_rank);
                }
            }
            Console.WriteLine(type);
            foreach (var item in dict.Keys)
            {
                Console.WriteLine(item);
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