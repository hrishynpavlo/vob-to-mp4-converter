namespace VobToMp4.Helpers;

public static class UiTextFormatter
{
    public static string FormatFileSize(long bytes)
    {
        string[] sizes = ["B", "KB", "MB", "GB"];
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
    
    public static string FormatTimeSpan(TimeSpan ts)
    {
        if (ts.TotalHours >= 1)
            return ts.ToString(@"hh\:mm\:ss");
        if (ts.TotalMinutes >= 1)
            return ts.ToString(@"mm\:ss");
        
        return ts.ToString(@"ss\.ff") + "s";
    }
}