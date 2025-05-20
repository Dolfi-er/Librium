using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;
using Project.Backend.Models;
using Project.Backend.DTOs;

namespace Project.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        private readonly AppDBContext _context;

        public StatusController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/statuses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusResponseDto>>> GetStatuses()
        {
            var statuses = await _context.Statuses
                .Select(s => new StatusResponseDto
                {
                    Id = s.Id,
                    StatusName = s.StatusName
                })
                .ToListAsync();

            return Ok(statuses);
        }

        // GET: api/statuses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<StatusResponseDto>> GetStatus(int id)
        {
            var status = await _context.Statuses
                .Where(s => s.Id == id)
                .Select(s => new StatusResponseDto
                {
                    Id = s.Id,
                    StatusName = s.StatusName
                })
                .FirstOrDefaultAsync();

            if (status == null)
            {
                return NotFound();
            }

            return Ok(status);
        }

        // POST: api/statuses
        [HttpPost]
        public async Task<ActionResult<StatusResponseDto>> PostStatus([FromBody] StatusCreateDto statusDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var status = new StatusModel
            {
                StatusName = statusDto.StatusName
            };

            _context.Statuses.Add(status);
            await _context.SaveChangesAsync();

            var responseDto = new StatusResponseDto
            {
                Id = status.Id,
                StatusName = status.StatusName
            };

            return CreatedAtAction(nameof(GetStatus), new { id = status.Id }, responseDto);
        }

        // PUT: api/statuses/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStatus(int id, [FromBody] StatusUpdateDto statusDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var status = await _context.Statuses.FindAsync(id);
            if (status == null)
            {
                return NotFound();
            }

            status.StatusName = statusDto.StatusName;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StatusExists(id))
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

        //DELETE: api/statuses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus(int id)
        {
            var status = await _context.Statuses.FindAsync(id);
            if (status == null)
            {
                return NotFound();
            }

            _context.Statuses.Remove(status);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool StatusExists(int id)
        {
            return _context.Statuses.Any(e => e.Id == id);
        }
    }
}