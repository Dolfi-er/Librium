using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Project.Backend.Models
{
    public class RoleModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(16)]
        public string Name { get; set; }

        //nav properties
        [JsonIgnore]
        public ICollection<UserModel> Users { get; set; }
    }
}