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
            _timer = new Timer(async state => await CheckTime(state), null, TimeSpan.FromMinutes(3), TimeSpan.FromMinutes(10));
            return Task.CompletedTask;
        }

        private async Task CheckTime(object? state)
        {
            if (_blockOverlap) {
                return;
            }
            var now = DateTime.Now.TimeOfDay;
            if (now.Minutes < 15)
            {
                _blockOverlap = true;
                Console.WriteLine(DateTime.Now.TimeOfDay);
                await ExecuteTask();
                _blockOverlap = false;
            }
        }

        private async Task ExecuteTask()
        {
            Console.WriteLine("START UPDATE");
            await _updateDatabase.RunUpdate();
            Console.WriteLine("FINISHED UPDATE");
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
