using System.ComponentModel.DataAnnotations;

namespace Project.Backend.DTOs
{
    public class TransmissionCreateDto
    {
        [Required] public int BookId { get; set; }
        [Required] public int UserId { get; set; }
        [Required] public DateTime IssuanceDate { get; set; }
        [Required] public DateTime DueDate { get; set; }
        [Required] public int StatusId { get; set; }
    }

    public static class TransmissionStatuses
    {
        public const int Issued = 1;      // Выдана
        public const int Returned = 2;    // Возвращена
        public const int Overdue = 3;     // Задержана
    }

    public class TransmissionUpdateDto
    {
        public DateTime? DueDate { get; set; }
        public int? StatusId { get; set; }
    }

    public class TransmissionResponseDto
    {
        public int BookId { get; set; }
        public int UserId { get; set; }
        public DateTime IssuanceDate { get; set; }
        public DateTime DueDate { get; set; }
        public int StatusId { get; set; }
        public string BookTitle { get; set; }
        public string UserLogin { get; set; }
        public string StatusName { get; set; }
    }
}