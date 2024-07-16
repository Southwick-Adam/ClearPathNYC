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
        private bool _blockOverlap;

        public UpdateService(ILogger<UpdateService> logger, UpdateDatabase updateDatabase)
        {
            _updateDatabase = updateDatabase;
            _timer = null;
            _logger = logger;
            _blockOverlap = false;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting background service...");
            _timer = new Timer(async state => await CheckTime(state), null, TimeSpan.Zero, TimeSpan.FromMinutes(5));
            return Task.CompletedTask;
        }

        private async Task CheckTime(object? state)
        {
            if (_blockOverlap) {
                _blockOverlap = false;
                return;
            }
            var now = DateTime.Now.TimeOfDay;
            if (now.Minutes < 5 && now.Hours % 2 == 0)
            {
                await ExecuteTask();
                _blockOverlap = true;
            }
        }

        private async Task ExecuteTask()
        {
            await _updateDatabase.RunUpdate();
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