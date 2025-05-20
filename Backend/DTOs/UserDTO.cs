using System.ComponentModel.DataAnnotations;

namespace Project.Backend.DTOs
{
    public class UserCreateDto
    {
        [Required]
        [MaxLength(48)]
        public string Login { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public int RoleId { get; set; }

        // Общие поля для Info
        [Required]
        [MaxLength(65)]
        public string Fio { get; set; }

        [Required]
        [Phone]
        [MaxLength(20)]
        public string Phone { get; set; }

        // Поля только для Читателя
        public string? TicketNumber { get; set; }
        public DateTime? Birthday { get; set; }
        public string? Education { get; set; }
        public int? HallId { get; set; }
    }

    public class UserUpdateDto
    {
        [MaxLength(48)]
        public string? Login { get; set; }
        public string? Password { get; set; }
        
        // Общие поля
        [MaxLength(65)]
        public string? Fio { get; set; }
        
        [Phone]
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        // Поля только для Читателя
        public string? TicketNumber { get; set; }
        public DateTime? Birthday { get; set; }
        public string? Education { get; set; }
        public int? HallId { get; set; }
    }

    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Login { get; set; }
        public RoleResponseDto Role { get; set; }
        public InfoResponseDto Info { get; set; }
    }

    public class InfoResponseDto
    {
        public string Fio { get; set; }
        public string Phone { get; set; }
        public string? TicketNumber { get; set; }
        public DateTime? Birthday { get; set; }
        public string? Education { get; set; }
        public int? HallId { get; set; }
    }
}