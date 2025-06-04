using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;
using Project.Backend.DTOs;
using Project.Backend.Factories;
using Project.Backend.Models;
using Project.Backend.Services;
using System.ComponentModel.DataAnnotations;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;

namespace Project.Backend.Controllers
{
    [Authorize(Roles = "Админ")]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly ILogger<UserController> _logger;
        private readonly IHallCapacityService _hallCapacityService;

        public UserController(AppDBContext context, ILogger<UserController> logger, IHallCapacityService hallCapacityService)
        {
            _context = context;
            _logger = logger;
            _hallCapacityService = hallCapacityService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .Include(u => u.Role)
                    .Include(u => u.Info)
                    .Select(u => new UserResponseDto
                    {
                        Id = u.Id,
                        Login = u.Login,
                        Role = new RoleResponseDto 
                        { 
                            Id = u.Role.Id, 
                            Name = u.Role.Name 
                        },
                        Info = new InfoResponseDto
                        {
                            Fio = u.Info.Fio,
                            Phone = u.Info.Phone,
                            TicketNumber = u.Info.TicketNumber,
                            Birthday = u.Info.Birthday,
                            Education = u.Info.Education,
                            HallId = u.Info.HallId
                        }
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching users");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/user
        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] UserCreateDto userDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Проверяем, можно ли привязать пользователя к залу (только для читателей)
            if (userDto.RoleId == 4 && userDto.HallId.HasValue)
            {
                var canAssign = await _hallCapacityService.CanAssignUserToHallAsync(userDto.HallId.Value);
                if (!canAssign)
                {
                    return BadRequest(new { message = "Выбранный зал переполнен. Выберите другой зал." });
                }
            }

            // Хэширование пароля
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password, 13);

            // Создание Info через фабрику
            var info = InfoFactory.CreateInfo(userDto, userDto.RoleId);

            // Создание пользователя
            var user = new UserModel
            {
                Login = userDto.Login,
                HashedPassword = hashedPassword,
                RoleId = userDto.RoleId,
                Info = info
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Обновляем вместимость зала, если пользователь привязан к залу
                if (info.HallId.HasValue)
                {
                    await _hallCapacityService.UpdateHallCapacityAsync(info.HallId.Value);
                }

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                await transaction.RollbackAsync();
                return StatusCode(500, "Internal server error");
            }

            var response = new UserResponseDto
            {
                Id = user.Id,
                Login = user.Login,
                Role = new RoleResponseDto { Id = user.RoleId, Name = user.Role?.Name },
                Info = new InfoResponseDto
                {
                    Fio = info.Fio,
                    Phone = info.Phone,
                    TicketNumber = info.TicketNumber,
                    Birthday = info.Birthday,
                    Education = info.Education,
                    HallId = info.HallId
                }
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, response);
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Info)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            return new UserResponseDto
            {
                Id = user.Id,
                Login = user.Login,
                Role = new RoleResponseDto { Id = user.Role.Id, Name = user.Role.Name },
                Info = new InfoResponseDto
                {
                    Fio = user.Info.Fio,
                    Phone = user.Info.Phone,
                    TicketNumber = user.Info.TicketNumber,
                    Birthday = user.Info.Birthday,
                    Education = user.Info.Education,
                    HallId = user.Info.HallId
                }
            };
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto userDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users
                .Include(u => u.Info)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            var oldHallId = user.Info.HallId;

            // Проверяем, можно ли привязать пользователя к новому залу (только для читателей)
            if (user.RoleId == 4 && userDto.HallId.HasValue && userDto.HallId != oldHallId)
            {
                var canAssign = await _hallCapacityService.CanAssignUserToHallAsync(userDto.HallId.Value, id);
                if (!canAssign)
                {
                    return BadRequest(new { message = "Выбранный зал переполнен. Выберите другой зал." });
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Обновление основных полей
                if (!string.IsNullOrEmpty(userDto.Login))
                {
                    user.Login = userDto.Login;
                }

                if (!string.IsNullOrEmpty(userDto.Password))
                {
                    user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password, 13);
                }

                // Обновление Info в зависимости от роли
                if (user.RoleId == 4) // Читатель
                {
                    user.Info.Fio = userDto.Fio ?? user.Info.Fio;
                    user.Info.Phone = userDto.Phone ?? user.Info.Phone;
                    user.Info.TicketNumber = userDto.TicketNumber ?? user.Info.TicketNumber;
                    user.Info.Birthday = userDto.Birthday ?? user.Info.Birthday;
                    user.Info.Education = userDto.Education ?? user.Info.Education;
                    user.Info.HallId = userDto.HallId ?? user.Info.HallId;
                }
                else if (user.RoleId == 2 || user.RoleId == 3) // Админ/Библиотекарь
                {
                    user.Info.Fio = userDto.Fio ?? user.Info.Fio;
                    user.Info.Phone = userDto.Phone ?? user.Info.Phone;
                }

                await _context.SaveChangesAsync();

                // Обновляем вместимость старого зала
                if (oldHallId.HasValue)
                {
                    await _hallCapacityService.UpdateHallCapacityAsync(oldHallId.Value);
                }

                // Обновляем вместимость нового зала
                if (user.Info.HallId.HasValue && user.Info.HallId != oldHallId)
                {
                    await _hallCapacityService.UpdateHallCapacityAsync(user.Info.HallId.Value);
                }

                await transaction.CommitAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Error updating user");
                await transaction.RollbackAsync();
                return StatusCode(500, "Internal server error");
            }

            return NoContent();
        }

       [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Info)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            // Проверка на удаление администратора
            if (user.RoleId == 2) // Роль "Админ"
            {
                // Количество оставшихся администраторов
                var adminCount = await _context.Users
                    .CountAsync(u => u.RoleId == 2 && u.Id != id);
                    
                if (adminCount == 0)
                {
                    return BadRequest(new { 
                        message = "Нельзя удалить последнего администратора системы" 
                    });
                }
            }

            var hallId = user.Info.HallId;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                // Обновляем вместимость зала после удаления пользователя
                if (hallId.HasValue)
                {
                    await _hallCapacityService.UpdateHallCapacityAsync(hallId.Value);
                }

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user");
                await transaction.RollbackAsync();
                return StatusCode(500, "Internal server error");
            }

            return NoContent();
        }
    }
}
