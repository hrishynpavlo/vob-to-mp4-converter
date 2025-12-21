using Microsoft.AspNetCore.Components.Forms;
using VobToMp4.Domain;

namespace VobToMp4.Helpers;

public class FileValidator
{
    private const int MaxFileCount = 5;
    private static readonly IReadOnlySet<string> AllowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        ".vob"
    };
    
    public IReadOnlyDictionary<string, Result<None, MappingError>> Validate(IReadOnlyCollection<IBrowserFile> files)
    {
        return files.ToDictionary(k => k.Name, Validate);
    }
    
    private static Result<None, MappingError> Validate(IBrowserFile file)
    {
        // limit to 1 GB + 10%
        if (file.Size > 1e+9 * 1.1)
            return Reason.Input.FileTooLarge;

        var fileExtension = Path.GetExtension(file.Name);
        if (AllowedExtensions.Contains(fileExtension) is false)
            return Reason.Input.NotSupportedFileExtension;
        
        // TODO: validate by ffprobe info,and by content type
        
        return None.Instance;
    }
}