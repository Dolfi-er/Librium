using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;
using Project.Backend.DTOs;
using Project.Backend.Models;

namespace Project.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDBContext _context;

        public BooksController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooks()
        {
            var books = await _context.Books
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    PublishDate = b.PublishDate,
                    ISBN = b.ISBN,
                    AddmissionDate = b.AddmissionDate,
                    Quantity = b.Quantity,
                    Rating = b.Rating
                })
                .ToListAsync();

            return Ok(books);
        }

        // GET: api/books/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BookResponseDto>> GetBook(int id)
        {
            var book = await _context.Books
                .Where(b => b.Id == id)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    PublishDate = b.PublishDate,
                    ISBN = b.ISBN,
                    AddmissionDate = b.AddmissionDate,
                    Quantity = b.Quantity,
                    Rating = b.Rating
                })
                .FirstOrDefaultAsync();

            if (book == null)
            {
                return NotFound();
            }

            return Ok(book);
        }

        // POST: api/books
        [HttpPost]
        public async Task<ActionResult<BookResponseDto>> PostBook([FromBody] BookCreateDto bookDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var book = new BookModel
            {
                Title = bookDto.Title,
                PublishDate = bookDto.PublishDate,
                ISBN = bookDto.ISBN,
                AddmissionDate = DateTime.UtcNow, // Automatically set to current UTC time
                Quantity = bookDto.Quantity,
                Rating = bookDto.Rating
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            var responseDto = new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                PublishDate = book.PublishDate,
                ISBN = book.ISBN,
                AddmissionDate = book.AddmissionDate,
                Quantity = book.Quantity,
                Rating = book.Rating
            };

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, responseDto);
        }

        // PUT: api/books/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBook(int id, [FromBody] BookUpdateDto bookDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            book.Title = bookDto.Title;
            book.PublishDate = bookDto.PublishDate;
            book.ISBN = bookDto.ISBN;
            // AddmissionDate is not updated - it remains the original value
            book.Quantity = bookDto.Quantity;
            book.Rating = bookDto.Rating;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookExists(id))
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

        // DELETE: api/books/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
    }
}