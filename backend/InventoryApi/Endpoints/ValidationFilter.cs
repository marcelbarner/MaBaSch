using System.ComponentModel.DataAnnotations;

namespace InventoryApi.Endpoints;

public class ValidationFilter<T> : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var dto = context.Arguments.OfType<T>().FirstOrDefault();
        if (dto is null)
        {
            return await next(context);
        }

        var validationContext = new ValidationContext(dto);
        var results = new List<ValidationResult>();

        if (!Validator.TryValidateObject(dto, validationContext, results, validateAllProperties: true))
        {
            var errors = results
                .SelectMany(r => r.MemberNames.DefaultIfEmpty(string.Empty).Select(member => (member, r.ErrorMessage)))
                .GroupBy(x => x.member)
                .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage ?? "Ungültiger Wert.").ToArray());

            return Results.ValidationProblem(errors);
        }

        return await next(context);
    }
}
