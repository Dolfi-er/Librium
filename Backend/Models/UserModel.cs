using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class UserModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(48)]
        public string Login { get; set; }

        [Required]
        [MaxLength(255)]
        public string HashedPassword { get; set; }

        [Required]
        public int RoleId { get; set; }

        [Required]
        public int InfoId { get; set; }

        //nav properties
        public RoleModel Role { get; set; }
        public InfoModel Info { get; set; }
    }
}