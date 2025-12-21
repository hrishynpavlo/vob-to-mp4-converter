namespace VobToMp4.Domain;

public record MappingError
{
    public required int Code { get; init; }
    public required string Description { get; init; }
}