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
        }

        private async Task ModelCallAsync(string url, string filePath)
        {
            try
            {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            File.WriteAllText(filePath, content);
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error while fetching weather data: {ex.StatusCode}");
            }
        }

        public async Task UpdateDataFiles()
        {
            string taxiUrl = "http://models:4000/taxi";
            string subwayUrl = "http://models:4000/subway";
            string taxiFilePath = "../DataFiles/taxi_busyness_ranking.json";
            string subwayFilePath = "../DataFiles/subway_busyness_ranking.json";

            await ModelCallAsync(taxiUrl, taxiFilePath);
            await ModelCallAsync(subwayUrl, subwayFilePath);
        }
    }
}
