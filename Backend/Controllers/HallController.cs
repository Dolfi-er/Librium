using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;
using Project.Backend.Models;
using Project.Backend.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Project.Backend.Controllers
{
    [Authorize(Roles = "Админ")]
    [Authorize(Roles = "Библиотекарь")]
    [ApiController]
    [Route("api/[controller]")]
    public class HallController : ControllerBase
    {
        private readonly AppDBContext _context;

        public HallController(AppDBContext context)
        {
            _context = context;
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
                TakenCapacity = hallDto.TakenCapacity,
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

            hall.LibraryName = hallDto.LibraryName;
            hall.HallName = hallDto.HallName;
            hall.TotalCapacity = hallDto.TotalCapacity;
            hall.TakenCapacity = hallDto.TakenCapacity;
            hall.Specification = hallDto.Specification;

            try
            {
                await _context.SaveChangesAsync();
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