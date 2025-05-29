// TransmissionController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;
using Project.Backend.DTOs;
using Project.Backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace Project.Backend.Controllers
{
    [Authorize(Roles = "Админ")]
    [Authorize(Roles = "Библиотекарь")]
    [ApiController]
    [Route("api/[controller]")]
    public class TransmissionController : ControllerBase
    {
        private readonly AppDBContext _context;

        public TransmissionController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/transmission
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransmissionResponseDto>>> GetTransmissions()
        {
            return await _context.Transmissions
                .Include(t => t.Book)
                .Include(t => t.User)
                .Include(t => t.Status)
                .Select(t => new TransmissionResponseDto
                {
                    BookId = t.BookId,
                    UserId = t.UserId,
                    IssuanceDate = t.IssuanceDate,
                    DueDate = t.DueDate,
                    StatusId = t.StatusId,
                    BookTitle = t.Book.Title,
                    UserLogin = t.User.Login,
                    StatusName = t.Status.StatusName
                })
                .ToListAsync();
        }

        // GET: api/transmission/{bookId}/{userId}
        [HttpGet("{bookId}/{userId}")]
        public async Task<ActionResult<TransmissionResponseDto>> GetTransmission(int bookId, int userId)
        {
            var transmission = await _context.Transmissions
                .Include(t => t.Book)
                .Include(t => t.User)
                .Include(t => t.Status)
                .FirstOrDefaultAsync(t => t.BookId == bookId && t.UserId == userId);

            if (transmission == null) return NotFound();

            return new TransmissionResponseDto
            {
                BookId = transmission.BookId,
                UserId = transmission.UserId,
                IssuanceDate = transmission.IssuanceDate,
                DueDate = transmission.DueDate,
                StatusId = transmission.StatusId,
                BookTitle = transmission.Book.Title,
                UserLogin = transmission.User.Login,
                StatusName = transmission.Status.StatusName
            };
        }

        // GET: api/transmission/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<TransmissionResponseDto>>> GetTransmissionsByUser(int userId)
        {
            return await _context.Transmissions
                .Include(t => t.Book)
                .Include(t => t.User)
                .Include(t => t.Status)
                .Where(t => t.UserId == userId)
                .Select(t => new TransmissionResponseDto
                {
                    BookId = t.BookId,
                    UserId = t.UserId,
                    IssuanceDate = t.IssuanceDate,
                    DueDate = t.DueDate,
                    StatusId = t.StatusId,
                    BookTitle = t.Book.Title,
                    UserLogin = t.User.Login,
                    StatusName = t.Status.StatusName
                })
                .ToListAsync();
        }

        // GET: api/transmission/book/{bookId}
        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<IEnumerable<TransmissionResponseDto>>> GetTransmissionsByBook(int bookId)
        {
            return await _context.Transmissions
                .Include(t => t.Book)
                .Include(t => t.User)
                .Include(t => t.Status)
                .Where(t => t.BookId == bookId)
                .Select(t => new TransmissionResponseDto
                {
                    BookId = t.BookId,
                    UserId = t.UserId,
                    IssuanceDate = t.IssuanceDate,
                    DueDate = t.DueDate,
                    StatusId = t.StatusId,
                    BookTitle = t.Book.Title,
                    UserLogin = t.User.Login,
                    StatusName = t.Status.StatusName
                })
                .ToListAsync();
        }        

        // POST: api/transmission
        [HttpPost]
        public async Task<ActionResult<TransmissionResponseDto>> CreateTransmission(
            [FromBody] TransmissionCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Проверка существования связанных сущностей
            if (!await _context.Books.AnyAsync(b => b.Id == dto.BookId))
                return BadRequest("Book not found");
            
            if (!await _context.Users.AnyAsync(u => u.Id == dto.UserId))
                return BadRequest("User not found");
            
            if (!await _context.Statuses.AnyAsync(s => s.Id == dto.StatusId))
                return BadRequest("Status not found");

            var transmission = new TransmissionModel
            {
                BookId = dto.BookId,
                UserId = dto.UserId,
                IssuanceDate = dto.IssuanceDate,
                DueDate = dto.DueDate,
                StatusId = dto.StatusId
            };

            _context.Transmissions.Add(transmission);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransmission), 
                new { bookId = transmission.BookId, userId = transmission.UserId },
                await GetTransmission(transmission.BookId, transmission.UserId));
        }

        // PUT: api/transmission/{bookId}/{userId}
        [HttpPut("{bookId}/{userId}")]
        public async Task<IActionResult> UpdateTransmission(
            int bookId, int userId, 
            [FromBody] TransmissionUpdateDto dto)
        {
            var transmission = await _context.Transmissions
                .FirstOrDefaultAsync(t => t.BookId == bookId && t.UserId == userId);

            if (transmission == null) return NotFound();

            if (dto.DueDate.HasValue) transmission.DueDate = dto.DueDate.Value;
            if (dto.StatusId.HasValue) transmission.StatusId = dto.StatusId.Value;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransmissionExists(bookId, userId))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/transmission/{bookId}/{userId}
        [HttpDelete("{bookId}/{userId}")]
        public async Task<IActionResult> DeleteTransmission(int bookId, int userId)
        {
            var transmission = await _context.Transmissions
                .FirstOrDefaultAsync(t => t.BookId == bookId && t.UserId == userId);

            if (transmission == null) return NotFound();

            _context.Transmissions.Remove(transmission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransmissionExists(int bookId, int userId)
        {
            return _context.Transmissions
                .Any(t => t.BookId == bookId && t.UserId == userId);
        }
    }
}