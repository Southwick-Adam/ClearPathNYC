using System;

namespace aspRun.ApiCalls
{
    public class WeatherStartup(WeatherAPI weatherAPI) : IHostedService
    {
        private readonly WeatherAPI _weatherAPI = weatherAPI;

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _weatherAPI.GetWeatherAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}