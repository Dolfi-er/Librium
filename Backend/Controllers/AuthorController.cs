using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.Backend.Data;
using Project.Backend.Models;
using Project.Backend.DTOs;
using System.Text.Json.Serialization;

namespace Project.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorsController : ControllerBase
    {
        private readonly AppDBContext _context;

        public AuthorsController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/authors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuthorResponseDto>>> GetAuthors()
        {
            var authors = await _context.Authors
                .Select(a => new AuthorResponseDto
                {
                    Id = a.Id,
                    AuthorName = a.AuthorName
                })
                .ToListAsync();

            return Ok(authors);
        }

        // GET: api/authors/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AuthorResponseDto>> GetAuthor(int id)
        {
            var author = await _context.Authors
                .Where(a => a.Id == id)
                .Select(a => new AuthorResponseDto
                {
                    Id = a.Id,
                    AuthorName = a.AuthorName
                })
                .FirstOrDefaultAsync();

            if (author == null)
            {
                return NotFound();
            }

            return Ok(author);
        }

        // POST: api/authors
        [HttpPost]
        public async Task<ActionResult<AuthorResponseDto>> PostAuthor([FromBody] AuthorCreateDto authorDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var author = new AuthorModel
            {
                AuthorName = authorDto.AuthorName
            };

            _context.Authors.Add(author);
            await _context.SaveChangesAsync();

            var responseDto = new AuthorResponseDto
            {
                Id = author.Id,
                AuthorName = author.AuthorName
            };

            return CreatedAtAction(nameof(GetAuthor), new { id = author.Id }, responseDto);
        }

        // PUT: api/authors/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAuthor(int id, [FromBody] AuthorUpdateDto authorDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var author = await _context.Authors.FindAsync(id);
            if (author == null)
            {
                return NotFound();
            }

            author.AuthorName = authorDto.AuthorName;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AuthorExists(id))
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

        // DELETE: api/authors/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
            {
                return NotFound();
            }

            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AuthorExists(int id)
        {
            return _context.Authors.Any(e => e.Id == id);
        }
    }
}