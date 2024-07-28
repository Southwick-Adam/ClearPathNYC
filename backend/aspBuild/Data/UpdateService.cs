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
            _timer = new Timer(async state => await CheckTime(state), null, TimeSpan.FromMinutes(2), TimeSpan.FromMinutes(2));
            return Task.CompletedTask;
        }

        private async Task CheckTime(object? state)
        {
            Console.WriteLine("Called");
            Console.WriteLine("_blockOverlap");
            Console.WriteLine(_blockOverlap);
            if (_blockOverlap) {
                Console.WriteLine("Not in task");
                return;
            }
            Console.WriteLine("In task before minute check");
            var now = DateTime.Now.TimeOfDay;
            Console.WriteLine(now.Minutes);
            if (now.Minutes < 5)
            {
                _blockOverlap = true;
                Console.WriteLine(DateTime.Now.TimeOfDay);
                await ExecuteTask();
                _blockOverlap = false;
                Console.WriteLine("_blockOverlap after");
                Console.WriteLine(_blockOverlap);
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
