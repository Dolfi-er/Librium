using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Project.Backend.Models
{
    public class StatusModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string StatusName { get; set; }

        //nav properties
        [JsonIgnore]
        public ICollection<TransmissionModel> Transmissions { get; set; }
    }
}