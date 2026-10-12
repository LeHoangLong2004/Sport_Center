using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Repositories;

public sealed partial class SupabaseGroupClassRepository
{
    public async Task NotifyAffectedMembersAsync(Guid classId, string title, string message)
    {
        try
        {
            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  SELECT user_id, {1}, {2} 
                  FROM class_bookings 
                  WHERE class_id = {0} AND status IN ('confirmed', 'pending')",
                classId,
                title,
                message
            );

            await _dbContext.Database.ExecuteSqlRawAsync(
                @"INSERT INTO notifications (user_id, title, message)
                  SELECT coaches.user_id, {1}, {2} 
                  FROM classes 
                  INNER JOIN coaches ON classes.coach_id = coaches.id
                  WHERE classes.id = {0}",
                classId,
                title,
                message
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Notification Error] {ex.Message}");
            // Ignore error if notifications table doesn't exist yet
        }
    }

    // ── GIAI ĐOẠN G: ĐIỂM DANH & XEM LỊCH ──

}
