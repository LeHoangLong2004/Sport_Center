namespace SmartGym.Application.Exceptions;

public sealed class Flow5PlanAssignmentException : InvalidOperationException
{
    public Flow5PlanAssignmentException(string code, string message)
        : base(message)
    {
        Code = code;
    }

    public string Code { get; }
}
