using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class StatusModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string StatusName { get; set; }

        //nav properties
        public ICollection<TransmissionModel> Transmissions { get; set; }
    }
}