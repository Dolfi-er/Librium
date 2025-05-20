using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Project.Backend.Models
{
    public class BookModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; }

        public DateTime? PublishDate { get; set; }

        [Required]
        [MaxLength(13)]
        public string ISBN { get; set; }

        [Required]
        public DateTime AddmissionDate { get; set; }

        [Required]
        [DefaultValue(1)]
        public int Quantity { get; set; }

        [Required]
        public float Rating { get; set; }

        //nav properties
        [JsonIgnore]
        public ICollection<TransmissionModel> Transmissions { get; set; }
        [JsonIgnore]
        public ICollection<WrittenByModel> WrittenBys { get; set; }
    }
}