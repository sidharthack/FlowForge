using FlowForge.Core.Interfaces;

namespace FlowForge.Api.Services;

public class EmailBackgroundWorker : BackgroundService
{
    private readonly IEmailQueue _emailQueue;
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailBackgroundWorker> _logger;

    public EmailBackgroundWorker(IEmailQueue emailQueue, IEmailService emailService, ILogger<EmailBackgroundWorker> logger)
    {
        _emailQueue = emailQueue;
        _emailService = emailService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Background Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Waits here efficiently until a message is queued
                var message = await _emailQueue.DequeueAsync(stoppingToken);

                await _emailService.SendEmailAsync(message);
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown triggered
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred executing email send.");
            }
        }

        _logger.LogInformation("Email Background Worker is stopping.");
    }
}