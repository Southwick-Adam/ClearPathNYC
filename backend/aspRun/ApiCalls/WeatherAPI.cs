using System;
using DotNetEnv;

namespace aspRun.ApiCalls
{
    public class WeatherAPI
    {
        private readonly HttpClient _httpClient;

        public WeatherAPI(HttpClient httpClient)
        {
            _httpClient = httpClient;
            Env.Load();
        }

        public async Task<string> GetWeatherAsync()
        {
            //var key = Environment.GetEnvironmentVariable("WEATHER_KEY");
            var url = $"http://api.weatherapi.com/v1/current.json?key=0ce057b9fe234b0f977164628240207&q=10018&aqi=yes";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return content;
        }
    }
}
