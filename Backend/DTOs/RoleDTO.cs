using System.ComponentModel.DataAnnotations;

namespace Project.Backend.DTOs
{
    public class RoleCreateDto
    {
        [Required]
        [MaxLength(16)]
        public string Name { get; set; }
    }

    public class RoleUpdateDto
    {
        [Required]
        [MaxLength(16)]
        public string Name { get; set; }
    }

    public class RoleResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}