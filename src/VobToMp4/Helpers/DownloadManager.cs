using System.Collections.Concurrent;

namespace VobToMp4.Helpers;

/// <summary>
/// Maps a short-lived token to a file path so the browser can download via direct HTTP GET.
/// </summary>
public class DownloadManager
{
    private readonly ConcurrentDictionary<string, DownloadEntry> _tokens = new();

    public string Register(string filePath, string downloadFileName)
    {
        var token = Guid.NewGuid().ToString("N");
        _tokens[token] = new DownloadEntry(filePath, downloadFileName, DateTime.UtcNow);
        return token;
    }

    public DownloadEntry? TryGet(string token)
    {
        return _tokens.TryGetValue(token, out var entry) ? entry : null;
    }

    public void Remove(string token)
    {
        _tokens.TryRemove(token, out _);
    }

    public record DownloadEntry(string FilePath, string FileName, DateTime CreatedAt);
}

