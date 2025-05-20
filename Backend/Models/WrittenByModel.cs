using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class WrittenByModel
    {
        public int Id { get; set; }

        [Key]
        public int BookId { get; set; }
        [Key]
        public int AuthorId { get; set; }

        //nav properties
        public BookModel Book { get; set; }
        public AuthorModel Author { get; set; }
    }
}