using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGym.Api.Endpoints;

public static partial class AppointmentEndpoints
{
    public sealed record CreateAppointmentRequest(
        string? Date,
        string Time,
        string Title,
        string CustomerName,
        string? CoachName);

    public sealed record UpdateAppointmentStatusRequest(string Status);

    public class CoachAvailabilitySlotConflictModel
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("coach_id")]
        public Guid CoachId { get; set; }

        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime EndTime { get; set; }

        [Column("status")]
        public string Status { get; set; } = "";

        [Column("booked_member_name")]
        public string? BookedMemberName { get; set; }
    }
}

