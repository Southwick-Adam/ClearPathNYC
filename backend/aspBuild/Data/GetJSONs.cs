using Newtonsoft.Json;

namespace aspBuild.Data 
{
    public class GetJSONs
    {
        public static Dictionary<string, int> getJSON(string jsonPath)
        {
            Dictionary<string, int> dict = new Dictionary<string, int>();

            string json = File.ReadAllText(jsonPath);

            var ListJSONValues = JsonConvert.DeserializeObject<List<JSONObject>>(json);
            
            foreach (var item in ListJSONValues)
            {
                dict.Add(item.LocationID, item.busyness_rank);
            }
            
            return dict;
        }
    }

    public class JSONObject 
    {
        public string LocationID { get; set; }
        public int busyness_rank { get; set; }
    }
}