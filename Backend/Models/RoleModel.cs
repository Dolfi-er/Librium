using System.ComponentModel.DataAnnotations;
namespace Project.Backend.Models
{
    public class RoleModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(16)]
        public string Name { get; set; }

        //nav properties
        public ICollection<UserModel> Users { get; set; }
    }
}