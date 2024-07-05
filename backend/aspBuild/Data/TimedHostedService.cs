using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace aspBuild.Data
{
    public class TimedHostedService : IHostedService, IDisposable
    {
        private Timer _timer;
        private readonly IServiceProvider _services;
        private readonly ILogger<TimedHostedService> _logger;

        public TimedHostedService(IServiceProvider services, ILogger<TimedHostedService> logger)
        {
            _services = services;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Timed Hosted Service running.");
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromHours(1));
            return Task.CompletedTask;
        }

        private async void DoWork(object state)
        {
            using (var scope = _services.CreateScope())
            {
                var updateDatabase = scope.ServiceProvider.GetRequiredService<UpdateDatabase>();
                await updateDatabase.UpdateTheDatabase();
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Timed Hosted Service is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task ImmediateUpdate()
        {
            using (var scope = _services.CreateScope())
            {
                var updateDatabase = scope.ServiceProvider.GetRequiredService<UpdateDatabase>();
                await updateDatabase.UpdateTheDatabase();
            }
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}