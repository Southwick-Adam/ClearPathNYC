using System;
using System.Threading;
using System.Threading.Tasks;
using aspBuild.Data;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class DatabaseUpdateService : BackgroundService
{
    private readonly ILogger<DatabaseUpdateService> _logger;
    private Timer _timer;
    private bool _isUpdating;
    
    public DatabaseUpdateService(ILogger<DatabaseUpdateService> logger)
    {
        _logger = logger;
        _isUpdating = false;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromHours(1));
        return Task.CompletedTask;
    }

    private async void DoWork(object state)
    {
        if (_isUpdating)
        {
            _logger.LogInformation("Previous update is still running.");
            return;
        }

        _isUpdating = true;

        try
        {
            _logger.LogInformation("Starting database update at: {time}", DateTimeOffset.Now);
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            var updateDatabase = new UpdateDatabase();
            await updateDatabase.UpdateTheDatabase();

            stopwatch.Stop();
            _logger.LogInformation("Database update completed. Elapsed Time: {0} milliseconds", stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during database update.");
        }
        finally
        {
            _isUpdating = false;
        }
    }

    public override void Dispose()
    {
        _timer?.Dispose();
        base.Dispose();
    }
}
