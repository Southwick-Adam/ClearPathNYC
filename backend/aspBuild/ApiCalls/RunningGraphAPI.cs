using System;
using System.IO;

namespace aspBuild.ApiCalls
{
    public class RunningGraphAPI
    {
        private readonly HttpClient _httpClient;

        public RunningGraphAPI(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromMinutes(5);
        }

        public async Task ApiCallAsync()
        {
            try
            {
            var response = await _httpClient.PostAsync("https://clearpath.info.gf/graph", null);
            response.EnsureSuccessStatusCode();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error while triggering asp-run graph function: {ex.StatusCode}");
            }
        }
    }
}
