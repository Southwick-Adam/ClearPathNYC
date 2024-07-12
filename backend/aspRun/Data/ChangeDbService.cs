using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace aspRun.Data
{
    public class ChangeDbService : IHostedService, IDisposable
    {
        private readonly ILogger<ChangeDbService> _logger;
        private Timer? _timer;
        private readonly Neo4jService _neo4jService;
        private bool _changeToNeo4j1;

        public ChangeDbService(ILogger<ChangeDbService> logger, Neo4jService neo4jService)
        {
            _logger = logger;
            _neo4jService = neo4jService;
            _timer = null;
            _changeToNeo4j1 = true;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting background service...");
            _timer = new Timer(ExecuteTask, null, TimeSpan.Zero, TimeSpan.FromHours(1));
            return Task.CompletedTask;
        }

        private async void ExecuteTask(object? state)
        {
            try
            {
                await _neo4jService.CheckGraph();
                await _neo4jService.StopGraph();
                await _neo4jService.CheckGraph();
                _neo4jService.ChangeDB(_changeToNeo4j1);
                _changeToNeo4j1 = !_changeToNeo4j1;
                await _neo4jService.CheckGraph();
                await _neo4jService.StartGraph();
                await _neo4jService.CheckGraph();
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while executing ChangeDb: {ex.Message}");
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
