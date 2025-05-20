using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class InfoModel
    {
        public int Id { get; set; }

        [MaxLength(20)]
        public string? TicketNumber { get; set; }

        [MaxLength(65)]
        [Required]
        public string Fio { get; set; }

        public DateTime? Birthday { get; set; }

        [MaxLength(20)]
        [Required]
        [Phone]
        public string Phone { get; set; }

        [MaxLength(127)]
        public string? Education { get; set; }
        public int? HallId { get; set; }

        //nav properties
        public HallModel Hall { get; set; }
        public UserModel User { get; set; }
    }
}