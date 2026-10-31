namespace FlowForge.Core.Interfaces;

public record EmailMessage(string To, string Subject, string Body);

public interface IEmailService
{
    Task SendEmailAsync(EmailMessage message);
}

public interface IEmailQueue
{
    ValueTask QueueEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);
    ValueTask<EmailMessage> DequeueAsync(CancellationToken cancellationToken = default);
}