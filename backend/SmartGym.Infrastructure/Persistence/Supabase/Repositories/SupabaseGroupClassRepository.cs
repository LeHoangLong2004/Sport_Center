using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed class SupabaseGroupClassRepository : IGroupClassRepository
{
    private readonly global::Supabase.Client _client;
    private readonly SmartGymDbContext _dbContext;

    public SupabaseGroupClassRepository(global::Supabase.Client client, SmartGymDbContext dbContext)
    {
        _client = client;
        _dbContext = dbContext;
    }

    public async Task<GroupClass?> GetByIdAsync(Guid id)
    {
        var response = await _client.From<GroupClassModel>()
            .Where(x => x.Id == id)
            .Single();

        return response?.ToDomain();
    }

    public async Task<ClassDetailResponse?> GetClassDetailByIdAsync(Guid id)
    {
        var classResponse = await _client.From<GroupClassModel>()
            .Where(x => x.Id == id)
            .Single();

        if (classResponse == null) return null;
        var c = classResponse;

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();
        
        var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
        var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
        var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
        var coachUser = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

        var bookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>(
            "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE class_id = {0} AND status != 'cancelled'", id
        ).ToListAsync();
        
        var enrolledMembers = bookings.Select(b => {
            var memberUser = users.FirstOrDefault(u => u.Id == b.UserId);
            return new EnrolledMemberDto
            {
                MemberId = b.UserId,
                FullName = memberUser?.FullName ?? "Unknown",
                PhoneNumber = memberUser?.PhoneNumber ?? "Unknown",
                BookingStatus = b.Status
            };
        }).ToList();

        return new ClassDetailResponse(
            Id: c.Id,
            SportId: c.SportId,
            SportName: sport?.Name ?? "Unknown Sport",
            FacilityId: c.FacilityId,
            FacilityName: facility?.Name ?? "Unknown Facility",
            CoachId: c.CoachId,
            CoachName: coachUser?.FullName ?? "N/A",
            ClassName: c.ClassName,
            ScheduleTime: c.ScheduleTime,
            DurationMinutes: c.DurationMinutes,
            Capacity: c.Capacity,
            CurrentEnrolled: c.CurrentEnrolled,
            AvailableSpots: c.Capacity - c.CurrentEnrolled,
            EnrolledMembers: enrolledMembers
        );
    }

    public async Task<IEnumerable<GroupClass>> GetClassesByCoachAndDateAsync(Guid coachId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var response = await _client.From<GroupClassModel>()
            .Where(x => x.CoachId == coachId)
            .Where(x => x.ScheduleTime >= startOfDay)
            .Where(x => x.ScheduleTime < endOfDay)
            .Get();

        return response.Models.Select(x => x.ToDomain());
    }

    public async Task<IEnumerable<ClassResponse>> GetAllClassesAsync()
    {
        var classResponse = await _client.From<GroupClassModel>().Get();
        var classModels = classResponse.Models;
        if (!classModels.Any()) return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

        return classModels.Select(c =>
        {
            var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
            var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
            var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
            var user = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

            return new ClassResponse(
                Id: c.Id,
                SportId: c.SportId,
                SportName: sport?.Name ?? "Unknown Sport",
                FacilityId: c.FacilityId,
                FacilityName: facility?.Name ?? "Unknown Facility",
                CoachId: c.CoachId,
                CoachName: user?.FullName ?? "N/A",
                ClassName: c.ClassName,
                ScheduleTime: c.ScheduleTime,
                DurationMinutes: c.DurationMinutes,
                Capacity: c.Capacity,
                CurrentEnrolled: c.CurrentEnrolled,
                AvailableSpots: c.Capacity - c.CurrentEnrolled,
                Status: c.Status
            );
        }).OrderBy(x => x.ScheduleTime).ToList();
    }

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        var classResponse = await _client.From<GroupClassModel>()
            .Where(x => x.Status == true)
            .Where(x => x.ScheduleTime > DateTime.UtcNow)
            .Get();

        var classModels = classResponse.Models;
        if (!classModels.Any()) return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

        return classModels.Select(c =>
        {
            var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
            var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
            var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
            var user = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

            return new ClassResponse(
                Id: c.Id,
                SportId: c.SportId,
                SportName: sport?.Name ?? "Unknown Sport",
                FacilityId: c.FacilityId,
                FacilityName: facility?.Name ?? "Unknown Facility",
                CoachId: c.CoachId,
                CoachName: user?.FullName ?? "N/A",
                ClassName: c.ClassName,
                ScheduleTime: c.ScheduleTime,
                DurationMinutes: c.DurationMinutes,
                Capacity: c.Capacity,
                CurrentEnrolled: c.CurrentEnrolled,
                AvailableSpots: c.Capacity - c.CurrentEnrolled,
                Status: c.Status
            );
        }).OrderBy(x => x.ScheduleTime).ToList();
    }

    public async Task AddAsync(GroupClass groupClass)
    {
        if (groupClass.CoachId.HasValue)
        {
            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO coaches (id, user_id, specialty, experience_years)
                  VALUES ({0}, {0}, 'General Coach', 3)
                  ON CONFLICT (user_id) DO NOTHING",
                groupClass.CoachId.Value);
        }

        var model = new GroupClassModel
        {
            Id = groupClass.Id,
            SportId = groupClass.SportId,
            CoachId = groupClass.CoachId,
            FacilityId = groupClass.FacilityId,
            ClassName = groupClass.ClassName,
            ScheduleTime = groupClass.ScheduleTime,
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status
        };

        await _client.From<GroupClassModel>().Insert(model);
    }

    public async Task UpdateAsync(GroupClass groupClass)
    {
        var model = new GroupClassModel
        {
            Id = groupClass.Id,
            SportId = groupClass.SportId,
            CoachId = groupClass.CoachId,
            FacilityId = groupClass.FacilityId,
            ClassName = groupClass.ClassName,
            ScheduleTime = groupClass.ScheduleTime,
            DurationMinutes = groupClass.DurationMinutes,
            Capacity = groupClass.Capacity,
            CurrentEnrolled = groupClass.CurrentEnrolled,
            Status = groupClass.Status
        };

        await _client.From<GroupClassModel>().Update(model);
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> BookClassTransactionAsync(Guid userId, Guid classId, Guid subscriptionId)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
            var existingBookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>(
                "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE user_id = {0} AND class_id = {1} AND status IN ('confirmed', 'pending')",
                userId, classId).ToListAsync();

            if (existingBookings.Count > 0)
            {
                await transaction.RollbackAsync();
                return (false, "Hội viên đã đặt chỗ lớp học này trước đó rồi.");
            }

            var affectedRows = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE classes 
                  SET current_enrolled = current_enrolled + 1
                  WHERE id = {0} AND status = true 
                    AND current_enrolled < capacity AND schedule_time > now()",
                classId);

            if (affectedRows == 0)
            {
                await transaction.RollbackAsync();
                return (false, "Đặt lớp thất bại: Lớp học đã hết chỗ hoặc đã ngưng nhận đăng ký.");
            }

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO class_bookings (user_id, class_id, subscription_id, status)
                  VALUES ({0}, {1}, {2}, 'pending')
                  ON CONFLICT (user_id, class_id) 
                  DO UPDATE SET status = 'pending', subscription_id = {2}",
                userId, classId, subscriptionId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi đặt lớp. " + ex.Message);
        }
        });
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingTransactionAsync(Guid userId, Guid classId)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
            var affectedBooking = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE class_bookings 
                  SET status = 'cancelled' 
                  WHERE user_id = {0} AND class_id = {1} AND status IN ('confirmed', 'pending')",
                userId, classId);

            if (affectedBooking == 0)
            {
                await transaction.RollbackAsync();
                return (false, "Không tìm thấy thông tin đặt chỗ hoặc đã bị hủy.");
            }

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE classes 
                  SET current_enrolled = current_enrolled - 1 
                  WHERE id = {0}",
                classId);

            // try
            // {
            //     await _dbContext.Database.ExecuteSqlRawAsync(
            //         @"INSERT INTO notifications (user_id, title, message)
            //           VALUES ({0}, 'Hủy đặt lớp thành công', 'Bạn đã hủy chỗ thành công cho lớp học.')",
            //         userId);
            // }
            // catch { /* Ignore missing table */ }

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi hủy đặt lớp. " + ex.Message);
        }
        });
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> ApproveBookingAsync(Guid bookingId)
    {
        try
        {
            var affected = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE class_bookings 
                  SET status = 'confirmed' 
                  WHERE id = {0} AND status = 'pending'",
                bookingId);

            if (affected == 0) return (false, "Không tìm thấy đơn đặt hoặc đơn không ở trạng thái chờ duyệt.");
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, "Lỗi hệ thống khi duyệt lớp: " + ex.Message);
        }
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> RejectBookingAsync(Guid bookingId)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var booking = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>(
                    "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE id = {0}", bookingId).FirstOrDefaultAsync();
                
                if (booking == null || booking.Status != "pending")
                {
                    await transaction.RollbackAsync();
                    return (false, "Không tìm thấy đơn đặt hoặc đơn không ở trạng thái chờ duyệt.");
                }

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE class_bookings 
                      SET status = 'rejected' 
                      WHERE id = {0}",
                    bookingId);

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE classes 
                      SET current_enrolled = current_enrolled - 1 
                      WHERE id = {0}",
                    booking.ClassId);

                await transaction.CommitAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, "Lỗi hệ thống khi từ chối đơn: " + ex.Message);
            }
        });
    }
    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelClassTransactionAsync(Guid classId)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
            var affected = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE classes 
                  SET status = false 
                  WHERE id = {0}",
                classId);

            if (affected == 0)
            {
                await transaction.RollbackAsync();
                return (false, "Lớp học không tồn tại.");
            }

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE class_bookings 
                  SET status = 'class_cancelled' 
                  WHERE class_id = {0} AND status IN ('confirmed', 'pending')",
                classId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi hủy lớp học. " + ex.Message);
        }
        });
    }

    public async Task NotifyAffectedMembersAsync(Guid classId, string title, string message)
    {
        try
        {
            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  SELECT user_id, {1}, {2} 
                  FROM class_bookings 
                  WHERE class_id = {0} AND status IN ('confirmed', 'pending')",
                classId, title, message);

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  SELECT coaches.user_id, {1}, {2} 
                  FROM classes 
                  INNER JOIN coaches ON classes.coach_id = coaches.id
                  WHERE classes.id = {0}",
                classId, title, message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Notification Error] {ex.Message}");
            // Ignore error if notifications table doesn't exist yet
        }
    }

    // ── GIAI ĐOẠN G: ĐIỂM DANH & XEM LỊCH ──

    public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateAttendanceAsync(Guid classId, List<AttendanceRecordDto> attendanceList)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
            foreach (var item in attendanceList)
            {
                var validStatus = item.Status.ToLower() == "no_show" ? "no_show" : "attended";

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"UPDATE class_bookings 
                      SET status = {2} 
                      WHERE class_id = {0} AND user_id = {1}",
                    classId, item.MemberId, validStatus);
            }

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi điểm danh. " + ex.Message);
        }
        });
    }

    public async Task<MemberScheduleResponse> GetMemberScheduleAsync(Guid userId)
    {
        var response = new MemberScheduleResponse();

        var classBookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>(
            "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE user_id = {0}", userId
        ).ToListAsync();

        if (classBookings.Any())
        {
            var classes = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>(
                "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes").ToListAsync();
            var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
            var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
            var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
            var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

            response.ClassBookings = classBookings.Select(cb =>
            {
                var targetClass = classes.FirstOrDefault(c => c.Id == cb.ClassId);
                var sport = targetClass != null ? sports.FirstOrDefault(s => s.Id == targetClass.SportId) : null;
                var facility = targetClass != null ? facilities.FirstOrDefault(f => f.Id == targetClass.FacilityId) : null;
                var coach = targetClass != null ? coaches.FirstOrDefault(co => co.Id == targetClass.CoachId) : null;
                var coachUser = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

                return new MemberClassBookingDto
                {
                    BookingId = cb.Id,
                    ClassId = cb.ClassId,
                    ClassName = targetClass?.ClassName ?? "Unknown Class",
                    SportName = sport?.Name ?? "N/A",
                    FacilityName = facility?.Name ?? "N/A",
                    CoachName = coachUser?.FullName ?? "N/A",
                    ScheduleTime = targetClass?.ScheduleTime ?? DateTime.MinValue,
                    DurationMinutes = targetClass?.DurationMinutes ?? 60,
                    Status = cb.Status
                };
            }).OrderBy(x => x.ScheduleTime).ToList();
        }

        var ptSessions = await _dbContext.Database.SqlQueryRaw<PtSessionMemberSqlDto>(
            @"SELECT ps.id, ps.schedule_time, ps.duration_minutes, ps.status 
              FROM pt_sessions ps 
              INNER JOIN pt_enrollments pe ON ps.enrollment_id = pe.id 
              WHERE pe.user_id = {0}", userId
        ).ToListAsync();

        if (ptSessions.Any())
        {
            response.PtSessions = ptSessions.Select(ps => new MemberPtSessionDto
            {
                SessionId = ps.Id,
                CoachName = "Personal Trainer",
                ScheduleTime = ps.ScheduleTime,
                DurationMinutes = ps.DurationMinutes,
                Status = ps.Status
            }).OrderBy(x => x.ScheduleTime).ToList();
        }

        return response;
    }

    public async Task<IEnumerable<CoachClassScheduleDto>> GetCoachScheduleAsync(Guid coachUserId, DateTime? date)
    {
        var coach = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>(
            "SELECT id, user_id FROM coaches WHERE user_id = {0}", coachUserId).FirstOrDefaultAsync();

        if (coach == null) return Enumerable.Empty<CoachClassScheduleDto>();

        var allClasses = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>(
            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes WHERE coach_id = {0}", coach.Id).ToListAsync();

        if (date.HasValue)
        {
            var startOfDay = date.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            allClasses = allClasses.Where(c => c.ScheduleTime >= startOfDay && c.ScheduleTime < endOfDay).ToList();
        }

        if (!allClasses.Any()) return Enumerable.Empty<CoachClassScheduleDto>();

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var allBookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>("SELECT id, user_id, class_id, status, created_at FROM class_bookings").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

        var result = new List<CoachClassScheduleDto>();

        foreach (var c in allClasses)
        {
            var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
            var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);

            var enrolledMembers = (
                from cb in allBookings
                join u in users on cb.UserId equals u.Id
                where cb.ClassId == c.Id && cb.Status != "cancelled"
                select new EnrolledMemberDto
                {
                    MemberId = u.Id,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    BookingStatus = cb.Status
                }
            ).ToList();

            result.Add(new CoachClassScheduleDto
            {
                ClassId = c.Id,
                ClassName = c.ClassName,
                SportName = sport?.Name ?? "N/A",
                FacilityName = facility?.Name ?? "N/A",
                ScheduleTime = c.ScheduleTime,
                DurationMinutes = c.DurationMinutes,
                Capacity = c.Capacity,
                CurrentEnrolled = c.CurrentEnrolled,
                EnrolledMembers = enrolledMembers
            });
        }

        return result.OrderBy(x => x.ScheduleTime).ToList();
    }

    public async Task<IEnumerable<ClassResponse>> GetManagerScheduleAsync(Guid? facilityId, Guid? coachId, Guid? sportId, DateTime? date)
    {
        var allClasses = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>(
            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes").ToListAsync();

        if (facilityId.HasValue && facilityId.Value != Guid.Empty)
            allClasses = allClasses.Where(c => c.FacilityId == facilityId.Value).ToList();

        if (coachId.HasValue && coachId.Value != Guid.Empty)
            allClasses = allClasses.Where(c => c.CoachId == coachId.Value).ToList();

        if (sportId.HasValue && sportId.Value != Guid.Empty)
            allClasses = allClasses.Where(c => c.SportId == sportId.Value).ToList();

        if (date.HasValue)
        {
            var startOfDay = date.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            allClasses = allClasses.Where(c => c.ScheduleTime >= startOfDay && c.ScheduleTime < endOfDay).ToList();
        }

        if (!allClasses.Any()) return Enumerable.Empty<ClassResponse>();

        var sports = await _dbContext.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
        var facilities = await _dbContext.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();

        return allClasses.Select(c =>
        {
            var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
            var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
            var coach = coaches.FirstOrDefault(co => co.Id == c.CoachId);
            var user = coach != null ? users.FirstOrDefault(u => u.Id == coach.UserId) : null;

            return new ClassResponse(
                Id: c.Id,
                SportId: c.SportId,
                SportName: sport?.Name ?? "Unknown Sport",
                FacilityId: c.FacilityId,
                FacilityName: facility?.Name ?? "Unknown Facility",
                CoachId: c.CoachId,
                CoachName: user?.FullName ?? "N/A",
                ClassName: c.ClassName,
                ScheduleTime: c.ScheduleTime,
                DurationMinutes: c.DurationMinutes,
                Capacity: c.Capacity,
                CurrentEnrolled: c.CurrentEnrolled,
                AvailableSpots: c.Capacity - c.CurrentEnrolled,
                Status: c.Status
            );
        }).OrderBy(x => x.ScheduleTime).ToList();
    }

    public async Task<IEnumerable<BookingManagerResponse>> GetAllBookingsForManagerAsync()
    {
        var allClasses = await _dbContext.Database.SqlQueryRaw<ClassSqlRawModel>("SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes").ToListAsync();
        var allBookings = await _dbContext.Database.SqlQueryRaw<ClassBookingRawModel>("SELECT id, user_id, class_id, status, created_at FROM class_bookings").ToListAsync();
        var users = await _dbContext.Database.SqlQueryRaw<UserSqlRawModel>("SELECT id, full_name, phone_number FROM users").ToListAsync();
        var coaches = await _dbContext.Database.SqlQueryRaw<CoachSqlRawModel>("SELECT id, user_id FROM coaches").ToListAsync();

        var result = new List<BookingManagerResponse>();

        foreach (var b in allBookings)
        {
            var c = allClasses.FirstOrDefault(x => x.Id == b.ClassId);
            if (c == null) continue;

            var u = users.FirstOrDefault(x => x.Id == b.UserId);
            var coachName = c.CoachId.HasValue 
                ? users.FirstOrDefault(x => coaches.FirstOrDefault(co => co.Id == c.CoachId.Value)?.UserId == x.Id)?.FullName ?? "N/A"
                : "N/A";

            string formattedStatus = b.Status;
            if (b.Status == "confirmed") formattedStatus = "Confirmed";
            else if (b.Status == "pending") formattedStatus = "Pending";
            else if (b.Status == "rejected") formattedStatus = "Rejected";
            else if (b.Status == "cancelled") formattedStatus = "Cancelled";
            else if (b.Status == "attended") formattedStatus = "Confirmed";
            else if (b.Status == "no_show") formattedStatus = "Cancelled";

            result.Add(new BookingManagerResponse
            {
                Id = b.Id,
                MemberAvatar = "/assets/images/user-default.png",
                MemberName = u?.FullName ?? "Unknown",
                MemberPhone = u?.PhoneNumber ?? "Unknown",
                MemberCode = "MB-" + (u?.Id.ToString().Substring(0, 4).ToUpper() ?? "0000"),
                ClassName = c.ClassName,
                CoachName = coachName,
                StartTime = c.ScheduleTime,
                BookedAt = b.CreatedAt == default ? c.ScheduleTime.AddDays(-1) : b.CreatedAt,
                Status = formattedStatus
            });
        }

        return result.OrderByDescending(r => r.BookedAt);
    }
}

// ── RAW SQL POCO DTOs FOR EF CORE RAW QUERIES ──

public class ClassSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("sport_id")]
    public Guid SportId { get; set; }

    [Column("facility_id")]
    public Guid FacilityId { get; set; }

    [Column("coach_id")]
    public Guid? CoachId { get; set; }

    [Column("class_name")]
    public string ClassName { get; set; } = string.Empty;

    [Column("schedule_time")]
    public DateTime ScheduleTime { get; set; }

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [Column("capacity")]
    public int Capacity { get; set; }

    [Column("current_enrolled")]
    public int CurrentEnrolled { get; set; }

    [Column("status")]
    public bool Status { get; set; }
}

public class SportSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

public class FacilitySqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

public class CoachSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }
}

public class UserSqlRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Column("phone_number")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class PtSessionMemberSqlDto
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("schedule_time")]
    public DateTime ScheduleTime { get; set; }

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [Column("status")]
    public string Status { get; set; } = string.Empty;
}

public class ClassBookingRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("class_id")]
    public Guid ClassId { get; set; }

    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

public class PtEnrollmentRawModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("coach_id")]
    public Guid? CoachId { get; set; }
}
