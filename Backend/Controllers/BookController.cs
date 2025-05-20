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
                .Include(b => b.WrittenBys)
                .ThenInclude(w => w.Author)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    PublishDate = b.PublishDate,
                    ISBN = b.ISBN,
                    AddmissionDate = b.AddmissionDate,
                    Quantity = b.Quantity,
                    Rating = b.Rating,
                    AuthorIds = b.WrittenBys.Select(w => w.AuthorId).ToList() // Добавлено
                })
                .ToListAsync();

            return Ok(books);
        }

        // GET: api/books/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BookResponseDto>> GetBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.WrittenBys)
                .ThenInclude(w => w.Author)
                .Where(b => b.Id == id)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    PublishDate = b.PublishDate,
                    ISBN = b.ISBN,
                    AddmissionDate = b.AddmissionDate,
                    Quantity = b.Quantity,
                    Rating = b.Rating,
                    AuthorIds = b.WrittenBys.Select(w => w.AuthorId).ToList() // Добавлено
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
                AddmissionDate = DateTime.UtcNow,
                Quantity = bookDto.Quantity,
                Rating = bookDto.Rating
            };

            // Проверка существования авторов
            foreach (var authorId in bookDto.AuthorIds)
            {
                var authorExists = await _context.Authors.AnyAsync(a => a.Id == authorId);
                if (!authorExists)
                {
                    return BadRequest($"Author with id {authorId} not found.");
                }
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync(); // Сохраняем, чтобы получить Id книги

            // Добавление связей с авторами
            foreach (var authorId in bookDto.AuthorIds)
            {
                var writtenBy = new WrittenByModel
                {
                    BookId = book.Id,
                    AuthorId = authorId
                };

                // Проверка на дубликаты
                if (!await _context.WrittenBys.AnyAsync(w => w.BookId == book.Id && w.AuthorId == authorId))
                {
                    _context.WrittenBys.Add(writtenBy);
                }
            }

            await _context.SaveChangesAsync();

            var responseDto = new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                PublishDate = book.PublishDate,
                ISBN = book.ISBN,
                AddmissionDate = DateTime.UtcNow,
                Quantity = book.Quantity,
                Rating = book.Rating,
                AuthorIds = bookDto.AuthorIds
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

            var book = await _context.Books
                .Include(b => b.WrittenBys)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound();
            }

            // Обновление полей книги
            book.Title = bookDto.Title;
            book.PublishDate = bookDto.PublishDate;
            book.ISBN = bookDto.ISBN;
            book.Quantity = bookDto.Quantity;
            book.Rating = bookDto.Rating;

            // Проверка существования авторов
            foreach (var authorId in bookDto.AuthorIds)
            {
                var authorExists = await _context.Authors.AnyAsync(a => a.Id == authorId);
                if (!authorExists)
                {
                    return BadRequest($"Author with id {authorId} not found.");
                }
            }

            // Удаление старых связей
            var existingWrittenBys = book.WrittenBys.ToList();
            _context.WrittenBys.RemoveRange(existingWrittenBys);

            // Добавление новых связей
            foreach (var authorId in bookDto.AuthorIds)
            {
                var writtenBy = new WrittenByModel
                {
                    BookId = id,
                    AuthorId = authorId
                };
                _context.WrittenBys.Add(writtenBy);
            }

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
            var book = await _context.Books
                .Include(b => b.WrittenBys) // Важно для каскадного удаления
                .FirstOrDefaultAsync(b => b.Id == id);

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