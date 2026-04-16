using Microsoft.AspNetCore.Components.Forms;

namespace VobToMp4.Models;

public class FileConversionItem
{
    public required IBrowserFile BrowserFile { get; init; }
    public string FileName => BrowserFile.Name;
    public long OriginalSize => BrowserFile.Size;

    public FileConversionStatus Status { get; set; } = FileConversionStatus.Ready;
    public string CurrentTimestamp { get; set; } = "00:00:00";
    public string StatusMessage { get; set; } = "Waiting...";
    public string? ErrorMessage { get; set; }

    // Filled after conversion
    public string? OutputPath { get; set; }
    public long ConvertedSize { get; set; }
    public TimeSpan VideoDuration { get; set; }
    public TimeSpan ConversionTime { get; set; }
}

public enum FileConversionStatus
{
    Ready,
    Pending,
    Converting,
    ReadingOutput,
    Completed,
    Downloaded,
    Failed
}

