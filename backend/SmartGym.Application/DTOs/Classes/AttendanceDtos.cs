using System;
using System.Collections.Generic;

namespace SmartGym.Application.DTOs.Classes;

public class AttendanceRecordDto
{
    public Guid MemberId { get; set; }
    public string Status { get; set; } = "attended"; // "attended" hoặc "no_show"
}

public class UpdateAttendanceRequest
{
    public List<AttendanceRecordDto> AttendanceList { get; set; } = new();
}
