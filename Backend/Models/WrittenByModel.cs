using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class WrittenByModel
    {
        public int BookId { get; set; }
        public int AuthorId { get; set; }
        public BookModel Book { get; set; }
        public AuthorModel Author { get; set; }
    }
}