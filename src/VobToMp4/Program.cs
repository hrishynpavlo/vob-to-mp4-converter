using FFMpegCore;
using Serilog;
using VobToMp4.Components;
using VobToMp4.Helpers;

namespace VobToMp4;

public class Program
{
    public static void Main(string[] args)
    {
        try
        {
            var configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false)
                .Build();
            
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .MinimumLevel.Information()
                .WriteTo.Console()
                .CreateLogger();
        
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services
                .AddSingleton<IConfiguration>(configuration)
                .AddSingleton<FileValidator>()
                .AddSingleton<DownloadManager>()
                .AddSerilog()
                .AddRazorComponents()
                .AddInteractiveServerComponents();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseAntiforgery();

            app.MapStaticAssets();

            app.MapGet("/api/download/{token}", (string token, DownloadManager dm) =>
            {
                var entry = dm.TryGet(token);
                if (entry is null || !File.Exists(entry.FilePath))
                    return Results.NotFound();

                var stream = File.OpenRead(entry.FilePath);
                return Results.File(stream, "video/mp4", entry.FileName, enableRangeProcessing: true);
            });

            app.MapRazorComponents<App>()
                .AddInteractiveServerRenderMode();

            app.Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application terminated unexpectedly");
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
