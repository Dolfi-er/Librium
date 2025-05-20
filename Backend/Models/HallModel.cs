using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Project.Backend.Models
{
    public class HallModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string LibraryName { get; set; }

        [Required]
        [MaxLength(30)]
        public string HallName { get; set; }

        [Required]
        [DefaultValue(1)]
        public int TotalCapacity { get; set; }

        [Required]
        [DefaultValue(0)]
        public int TakenCapacity { get; set; }
        public string? Specification { get; set; }

        //nav properties
        public ICollection<InfoModel> Infos { get; set; }
    }
}