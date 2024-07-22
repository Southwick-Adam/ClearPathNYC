using Newtonsoft.Json;

namespace aspBuild.Data
{
    public class GetJSONs
    {
        public static Dictionary<int, int> GetJSON(string jsonPath, string type)
        {
            Dictionary<int, int> dict = [];

            string json = File.ReadAllText(jsonPath);

            if (string.Equals(type, "taxi"))
            {
                List<JSONObjectTaxi>? ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectTaxi>>(json);
                dict.Add(-1, 3);
                if (ListJSONValues != null)
                {
                    foreach (var item in ListJSONValues)
                    {
                        if (item != null)
                        {
                            dict.Add(item.LocationID, ScoreMap(item.Busyness_rank));
                        }
                    }
                }
            }
            if (string.Equals(type, "metro"))
            {
                List<JSONObjectMetro>? ListJSONValues = JsonConvert.DeserializeObject<List<JSONObjectMetro>>(json);
                if (ListJSONValues != null)
                {
                    foreach (var item in ListJSONValues)
                    {
                        if (item != null)
                        {
                            dict.Add(item.station_complex_id, ScoreMap(item.Busyness_rank));
                        }

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
        public int LocationID { get; set; }
        public int Busyness_rank { get; set; }
    }

    public class JSONObjectMetro
    {
        public int station_complex_id { get; set; }
        public int Busyness_rank { get; set; }
    }
}