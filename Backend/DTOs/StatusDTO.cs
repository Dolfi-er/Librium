using System.ComponentModel.DataAnnotations;

namespace Project.Backend.DTOs
{
    public class StatusCreateDto
    {
        [Required]
        [MaxLength(10)]
        public string StatusName { get; set; }
    }

    public class StatusUpdateDto
    {
        [Required]
        [MaxLength(10)]
        public string StatusName { get; set; }
    }

    public class StatusResponseDto
    {
        public int Id { get; set; }
        public string StatusName { get; set; }
    }
}