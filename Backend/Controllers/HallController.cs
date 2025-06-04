using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;
using Project.Backend.Models;
using Project.Backend.DTOs;
using Project.Backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace Project.Backend.Controllers
{
    [Authorize(Roles = "Админ, Библиотекарь")]
    [ApiController]
    [Route("api/[controller]")]
    public class HallController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IHallCapacityService _hallCapacityService;

        public HallController(AppDBContext context, IHallCapacityService hallCapacityService)
        {
            _context = context;
            _hallCapacityService = hallCapacityService;
        }

        // GET: api/halls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HallResponseDto>>> GetHalls()
        {
            var halls = await _context.Halls
                .Select(h => new HallResponseDto
                {
                    Id = h.Id,
                    LibraryName = h.LibraryName,
                    HallName = h.HallName,
                    TotalCapacity = h.TotalCapacity,
                    TakenCapacity = h.TakenCapacity,
                    Specification = h.Specification
                })
                .ToListAsync();

            return Ok(halls);
        }

        // GET: api/halls/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<HallResponseDto>> GetHall(int id)
        {
            var hall = await _context.Halls
                .Where(h => h.Id == id)
                .Select(h => new HallResponseDto
                {
                    Id = h.Id,
                    LibraryName = h.LibraryName,
                    HallName = h.HallName,
                    TotalCapacity = h.TotalCapacity,
                    TakenCapacity = h.TakenCapacity,
                    Specification = h.Specification
                })
                .FirstOrDefaultAsync();

            if (hall == null)
            {
                return NotFound();
            }

            return Ok(hall);
        }

        // POST: api/halls
        [HttpPost]
        public async Task<ActionResult<HallResponseDto>> PostHall([FromBody] HallCreateDto hallDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var hall = new HallModel
            {
                LibraryName = hallDto.LibraryName,
                HallName = hallDto.HallName,
                TotalCapacity = hallDto.TotalCapacity,
                TakenCapacity = 0, // Автоматически устанавливаем в 0 при создании
                Specification = hallDto.Specification
            };

            _context.Halls.Add(hall);
            await _context.SaveChangesAsync();

            var responseDto = new HallResponseDto
            {
                Id = hall.Id,
                LibraryName = hall.LibraryName,
                HallName = hall.HallName,
                TotalCapacity = hall.TotalCapacity,
                TakenCapacity = hall.TakenCapacity,
                Specification = hall.Specification
            };

            return CreatedAtAction(nameof(GetHall), new { id = hall.Id }, responseDto);
        }

        // PUT: api/halls/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHall(int id, [FromBody] HallUpdateDto hallDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var hall = await _context.Halls.FindAsync(id);
            if (hall == null)
            {
                return NotFound();
            }

            // Проверяем, не станет ли новая вместимость меньше текущего количества пользователей
            if (hallDto.TotalCapacity < hall.TakenCapacity)
            {
                return BadRequest(new { 
                    message = $"Нельзя установить вместимость меньше текущего количества пользователей ({hall.TakenCapacity})" 
                });
            }

            hall.LibraryName = hallDto.LibraryName;
            hall.HallName = hallDto.HallName;
            hall.TotalCapacity = hallDto.TotalCapacity;
            hall.Specification = hallDto.Specification;
            // TakenCapacity не обновляется вручную

            try
            {
                await _context.SaveChangesAsync();
                
                // Обновляем TakenCapacity для актуализации данных
                await _hallCapacityService.UpdateHallCapacityAsync(id);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HallExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/halls/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHall(int id)
        {
            var hall = await _context.Halls.FindAsync(id);
            if (hall == null)
            {
                return NotFound();
            }

            // Проверяем, есть ли пользователи, привязанные к этому залу
            var usersInHall = await _context.Users
                .Include(u => u.Info)
                .CountAsync(u => u.Info.HallId == id);

            if (usersInHall > 0)
            {
                return BadRequest(new { 
                    message = $"Нельзя удалить зал, к которому привязано {usersInHall} пользователей. Сначала переместите или удалите пользователей." 
                });
            }

            _context.Halls.Remove(hall);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HallExists(int id)
        {
            return _context.Halls.Any(e => e.Id == id);
        }
    }
}
