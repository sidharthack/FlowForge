using FlowForge.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace FlowForge.Infra.Email;

public class DevEmailService : IEmailService
{
    private readonly ILogger<DevEmailService> _logger;

    public DevEmailService(ILogger<DevEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(EmailMessage message)
    {
        // In production, this is where we'd use MailKit, SendGrid, or AWS SES
        _logger.LogInformation("\n========== SIMULATED EMAIL SEND ==========\nTo: {To}\nSubject: {Subject}\nBody:\n{Body}\n==========================================",
            message.To, message.Subject, message.Body);

        // Simulate network delay
        return Task.Delay(500);
    }
}