using System;
using System.IO;

namespace aspBuild.ApiCalls
{
    public class ModelAPI
    {
        private readonly HttpClient _httpClient;

        public ModelAPI(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromMinutes(5);
        }

        private async Task ModelCallAsync(string url, string filePath)
        {
            try
            {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Succes fetching data from {url}");
            File.WriteAllText(filePath, content);
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error while fetching {url} data: {ex.Message}");
            }
        }

        public async Task UpdateDataFiles()
        {
            string taxiUrl = "https://clearpath.info.gf/taxi";
            string subwayUrl = "https://clearpath.info.gf/subway";
            string taxiFilePath = "DataFiles/taxi_busyness_ranking.json";
            string subwayFilePath = "DataFiles/subway_busyness_ranking.json";

            await ModelCallAsync(taxiUrl, taxiFilePath);
            await ModelCallAsync(subwayUrl, subwayFilePath);
        }
    }
}
