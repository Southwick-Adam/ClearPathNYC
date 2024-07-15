using System;
using DotNetEnv;

namespace aspRun.ApiCalls
{
    public class WeatherAPI
    {
        private readonly HttpClient _httpClient;
        private string _result;

        public WeatherAPI(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _result = string.Empty;
            Env.Load();
        }

        public async Task GetWeatherAsync()
        {
            var key = Environment.GetEnvironmentVariable("WEATHER_KEY");
            var url = $"http://api.weatherapi.com/v1/current.json?key={key}&q=10018&aqi=yes";

            try
            {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            _result = content;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error while fetching weather data: {ex.StatusCode}");
            }
        }

        public string WeatherResult()
        {
            return _result;
        }
    }
}
