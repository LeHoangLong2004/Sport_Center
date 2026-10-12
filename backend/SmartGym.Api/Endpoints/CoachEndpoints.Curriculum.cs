using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
        public static partial class CoachEndpoints
    {
        private static void MapCurriculumEndpoints(RouteGroupBuilder group)
        {
            // 8. Curriculum Get
            group.MapGet(
                "/curricula",
                () =>
                {
                    return Results.Ok(_mockCurricula);
                }
            );

            // 9. Curriculum Save
            group.MapPost(
                "/curricula",
                ([FromBody] System.Text.Json.JsonElement request) =>
                {
                    var id = request.GetProperty("id").GetString();
                    var existingIndex = -1;
                    for (int i = 0; i < _mockCurricula.Count; i++)
                    {
                        if (_mockCurricula[i]?["id"]?.GetValue<string>() == id)
                        {
                            existingIndex = i;
                            break;
                        }
                    }

                    var newObj = System.Text.Json.Nodes.JsonObject.Create(request);
                    if (existingIndex >= 0)
                    {
                        _mockCurricula[existingIndex] = newObj;
                    }
                    else
                    {
                        _mockCurricula.Add(newObj);
                    }

                    return Results.Ok(new { success = true });
                }
            );

            // 10. Curriculum Assign
            group.MapPost(
                "/curricula/{id}/assign",
                (string id, [FromBody] System.Text.Json.JsonElement request) =>
                {
                    for (int i = 0; i < _mockCurricula.Count; i++)
                    {
                        if (_mockCurricula[i]?["id"]?.GetValue<string>() == id)
                        {
                            var target = System.Text.Json.Nodes.JsonObject.Create(request);
                            var assignedTo = _mockCurricula[i]["assignedTo"]?.AsArray();
                            if (assignedTo == null)
                            {
                                assignedTo = new System.Text.Json.Nodes.JsonArray();
                                _mockCurricula[i]["assignedTo"] = assignedTo;
                            }
                            assignedTo.Add(target);
                            _mockCurricula[i]["status"] = "Đã giao";
                            break;
                        }
                    }
                    return Results.Ok(new { success = true });
                }
            );

        }
    }
}
