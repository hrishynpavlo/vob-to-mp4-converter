namespace VobToMp4.Domain;

public static class Reason
{
    public static class Input
    {
        public static MappingError FileTooLarge => new()
        {
            Code = 1001,
            Description = "The uploaded file exceeds the maximum allowed size of 1 GB."
        };
        
        public static MappingError NotSupportedFileExtension => new()
        {
            Code = 1002,
            Description = "The uploaded file has an unsupported file extension."
        };
    }
}