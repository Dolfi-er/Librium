using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Models;

namespace Project.Backend.Data
{
    public static class SeedData
    {
        public static async Task Initialize(AppDBContext context, string adminPassword)
        {
            // Добавление ролей, если их нет
            if (!await context.Roles.AnyAsync())
            {
                await context.Roles.AddRangeAsync(
                    new RoleModel { Id = 2, Name = "Админ" },
                    new RoleModel { Id = 3, Name = "Библиотекарь" },
                    new RoleModel { Id = 4, Name = "Читатель" }
                );
                await context.SaveChangesAsync();
            }

            // Добавление статусов, если их нет
            if (!await context.Statuses.AnyAsync())
            {
                await context.Statuses.AddRangeAsync(
                    new StatusModel { Id = 1, StatusName = "Выдана" },
                    new StatusModel { Id = 2, StatusName = "Возвращена" },
                    new StatusModel { Id = 3, StatusName = "Задержана" }
                );
                await context.SaveChangesAsync();
            }

            // Добавление администратора, если его нет
            if (!await context.Users.AnyAsync(u => u.Login == "Admin"))
            {
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(adminPassword, 13);
                
                var adminInfo = new InfoModel
                {
                    Fio = "Иванов Иван Иванович",
                    Phone = "+79008003030"
                };

                context.Infos.Add(adminInfo);
                await context.SaveChangesAsync();

                var adminUser = new UserModel
                {
                    Login = "Admin",
                    HashedPassword = hashedPassword,
                    RoleId = 2,
                    InfoId = adminInfo.Id
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}