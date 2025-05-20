using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Project.Backend.Models
{
    public class AuthorModel
    {
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string AuthorName { get; set; }

        //nav properties
        [JsonIgnore]
        public ICollection<WrittenByModel> WrittenBys { get; set; }
    }
}