using System;
using System.Data;
using System.IO.Compression;

namespace aspBuild.Data
{
    public class UpdateService: IHostedService, IDisposable
    {
        private readonly UpdateDatabase _updateDatabase;
        private Timer? _timer;
        private readonly ILogger<UpdateService> _logger;

        public UpdateService(ILogger<UpdateService> logger, UpdateDatabase updateDatabase)
        {
            _updateDatabase = updateDatabase;
            _timer = null;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting background service...");
            _timer = new Timer(ExecuteTask, null, TimeSpan.Zero, TimeSpan.FromHours(2));
            return Task.CompletedTask;
        }

        private async void ExecuteTask(object? state)
        {
            await _updateDatabase.UpdateTheDatabase();
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