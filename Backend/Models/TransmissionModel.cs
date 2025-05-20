using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class TransmissionModel
    {
        public int Id { get; set; }
        [Key]
        public int BookId { get; set; }
        [Key]
        public int UserId { get; set; }

        [Required]
        public DateTime IssuanceDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        public int StatusId { get; set; }

        //nav properties
        public BookModel Book { get; set; }
        public UserModel User { get; set; }
        public StatusModel Status { get; set; }
    }
}