using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class AuthorModel
    {
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string AuthorName { get; set; }

        //nav properties
        public ICollection<WrittenByModel> WrittenBys { get; set; }
    }
}