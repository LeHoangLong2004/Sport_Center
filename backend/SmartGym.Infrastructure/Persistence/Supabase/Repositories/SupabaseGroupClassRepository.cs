using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;
using Microsoft.EntityFrameworkCore;
using System;

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

    public async Task<IEnumerable<ClassResponse>> GetAvailableClassesAsync()
    {
        // Giai đoạn B: Lọc status = true và schedule_time > now()
        var classResponse = await _client.From<GroupClassModel>()
            .Where(x => x.Status == true)
            .Where(x => x.ScheduleTime > DateTime.UtcNow)
            .Get();

        var classModels = classResponse.Models;
        if (!classModels.Any()) return Enumerable.Empty<ClassResponse>();

        // Lấy thông tin Sport, Facility, Coach (Batch Fetch)
        var sportIds = classModels.Select(c => c.SportId).Distinct().ToList();
        var facilityIds = classModels.Select(c => c.FacilityId).Distinct().ToList();
        var coachIds = classModels.Where(c => c.CoachId.HasValue).Select(c => c.CoachId!.Value).Distinct().ToList();

        var sports = (await _client.From<SportModel>().Get()).Models;
        var facilities = (await _client.From<FacilityModel>().Get()).Models;
        var coaches = (await _client.From<CoachModel>().Get()).Models;
        var users = await _dbContext.Users.ToListAsync();

        // Map DTO
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
                AvailableSpots: c.Capacity - c.CurrentEnrolled
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

    public async Task<(bool IsSuccess, string? ErrorMessage)> BookClassTransactionAsync(Guid userId, Guid classId, Guid subscriptionId)
    {
        // Thực thi SQL Transaction thông qua Entity Framework (được Inject ở tầng Infrastructure)
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var affectedRows = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE classes 
                  SET current_enrolled = current_enrolled + 1
                  WHERE id = {0} AND status = true 
                    AND current_enrolled < capacity AND schedule_time > now()",
                classId);

            if (affectedRows == 0)
            {
                await transaction.RollbackAsync();
                return (false, "Lớp đã đầy, đã đóng hoặc đã bắt đầu.");
            }

            // Insert or Update booking
            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO class_bookings (user_id, class_id, subscription_id, status)
                  VALUES ({0}, {1}, {2}, 'confirmed')
                  ON CONFLICT (user_id, class_id) 
                  DO UPDATE SET status = 'confirmed', subscription_id = {2}",
                userId, classId, subscriptionId);

            // Insert notification
            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  VALUES ({0}, 'Đặt lớp thành công', 'Bạn đã đặt chỗ thành công cho lớp học.')",
                userId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi đặt lớp. " + ex.Message);
        }
    }

    public async Task<GroupClass?> GetByIdAsync(Guid id)
    {
        var response = await _client.From<GroupClassModel>()
            .Where(x => x.Id == id)
            .Single();

        return response?.ToDomain();
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelBookingTransactionAsync(Guid userId, Guid classId)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var affectedBooking = await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE class_bookings 
                  SET status = 'cancelled' 
                  WHERE user_id = {0} AND class_id = {1} AND status = 'confirmed'",
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

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  VALUES ({0}, 'Hủy đặt lớp thành công', 'Bạn đã hủy chỗ thành công cho lớp học.')",
                userId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi hủy lớp. " + ex.Message);
        }
    }

    public async Task<(bool IsSuccess, string? ErrorMessage)> CancelClassTransactionAsync(Guid classId)
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

            // Update bookings
            await _dbContext.Database.ExecuteSqlRawAsync(
                @"UPDATE class_bookings 
                  SET status = 'class_cancelled' 
                  WHERE class_id = {0} AND status = 'confirmed'",
                classId);

            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, "Lỗi hệ thống khi hủy lớp học. " + ex.Message);
        }
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

    public async Task NotifyAffectedMembersAsync(Guid classId, string title, string message)
    {
        // Insert notifications for all confirmed members of the class and the coach
        await _dbContext.Database.ExecuteSqlRawAsync(
            @"INSERT INTO notifications (user_id, title, message)
              SELECT user_id, {1}, {2} 
              FROM class_bookings 
              WHERE class_id = {0} AND status = 'confirmed'",
            classId, title, message);

        await _dbContext.Database.ExecuteSqlRawAsync(
            @"INSERT INTO notifications (user_id, title, message)
              SELECT coaches.user_id, {1}, {2} 
              FROM classes 
              INNER JOIN coaches ON classes.coach_id = coaches.id
              WHERE classes.id = {0}",
            classId, title, message);
    }
}
