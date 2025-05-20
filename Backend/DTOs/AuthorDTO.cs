using System.ComponentModel.DataAnnotations;

namespace Project.Backend.DTOs
{
    public class AuthorCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string AuthorName { get; set; }
    }

    public class AuthorUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string AuthorName { get; set; }
    }
    
    public class AuthorResponseDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; }
    }
}