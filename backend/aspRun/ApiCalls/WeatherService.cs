using System;

namespace aspRun.ApiCalls
{
    public class WeatherService: IHostedService, IDisposable
    {
        private readonly WeatherAPI _weatherAPI;
        private Timer? _timer;
        private readonly ILogger<WeatherService> _logger;

        public WeatherService(ILogger<WeatherService> logger, WeatherAPI weatherAPI)
        {
            _weatherAPI = weatherAPI;
            _timer = null;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting background service...");
            UpdateWeather();
            _timer = new Timer(ExecuteTask, null, TimeSpan.Zero, TimeSpan.FromMinutes(15));

            return Task.CompletedTask;
        }

        private void ExecuteTask(object? state)
        {
            UpdateWeather();
        }

        private async void UpdateWeather()
        {
            try
            {
                await _weatherAPI.GetWeatherAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while updating the weather: {ex.Message}");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping background service...");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}