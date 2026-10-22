using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public interface IFlow5RecommendationJsonParser
{
    Flow5JsonParseResult Parse(string rawContent);
}
