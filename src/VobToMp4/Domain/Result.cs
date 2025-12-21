namespace VobToMp4.Domain;

public readonly record struct Result<TSuccess, TFailure> where TFailure : MappingError
{
    public TSuccess? Ok { get; init; }
    public TFailure? Error { get; init; }

    public bool IsOk => Error is null;
    
    public void Deconstruct(out bool isOk, out TSuccess? ok, out TFailure? error)
    {
        isOk = IsOk;
        ok = Ok;
        error = Error;
    }
    
    public static explicit operator TSuccess?(Result<TSuccess, TFailure> result) => result.Ok; 
    public static explicit operator TFailure?(Result<TSuccess, TFailure> result) => result.Error;

    public static implicit operator Result<TSuccess, TFailure>(TSuccess ok) => new() { Ok = ok };
    public static implicit operator Result<TSuccess, TFailure>(TFailure error) => new() { Error = error };
}

public readonly record struct None
{
    public static None Instance { get; } = new();
}