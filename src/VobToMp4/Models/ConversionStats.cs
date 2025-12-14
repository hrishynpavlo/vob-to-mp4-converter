namespace VobToMp4.Models;

public record ConversionStats
{
    public required string ConversionTime { get; init; } 
    public required string VideoDuration { get; init; }
    public required string OriginalSize { get; init; } 
    public required string ConvertedSize { get; init; }
}