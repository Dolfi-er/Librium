using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;

namespace Project.Backend.Services
{
    public interface IHallCapacityService
    {
        Task UpdateHallCapacityAsync(int hallId);
        Task<bool> CanAssignUserToHallAsync(int hallId, int? excludeUserId = null);
    }

    public class HallCapacityService : IHallCapacityService
    {
        private readonly AppDBContext _context;

        public HallCapacityService(AppDBContext context)
        {
            _context = context;
        }

        public async Task UpdateHallCapacityAsync(int hallId)
        {
            var hall = await _context.Halls.FindAsync(hallId);
            if (hall == null) return;

            // Подсчитываем количество пользователей, привязанных к этому залу
            var takenCapacity = await _context.Users
                .Include(u => u.Info)
                .CountAsync(u => u.Info.HallId == hallId);

            hall.TakenCapacity = takenCapacity;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> CanAssignUserToHallAsync(int hallId, int? excludeUserId = null)
        {
            var hall = await _context.Halls.FindAsync(hallId);
            if (hall == null) return false;

            // Подсчитываем текущее количество пользователей в зале
            var currentUsersQuery = _context.Users
                .Include(u => u.Info)
                .Where(u => u.Info.HallId == hallId);

            // Исключаем текущего пользователя при редактировании
            if (excludeUserId.HasValue)
            {
                currentUsersQuery = currentUsersQuery.Where(u => u.Id != excludeUserId.Value);
            }

            var currentUsers = await currentUsersQuery.CountAsync();
            
            return currentUsers < hall.TotalCapacity;
        }
    }
}
