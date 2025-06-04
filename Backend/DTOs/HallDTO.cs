using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Project.Backend.DTOs
{
    public class HallCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string LibraryName { get; set; }

        [Required]
        [MaxLength(30)]
        public string HallName { get; set; }

        [Required]
        [DefaultValue(1)]
        public int TotalCapacity { get; set; }

        public string? Specification { get; set; }
    }

    public class HallUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string LibraryName { get; set; }

        [Required]
        [MaxLength(30)]
        public string HallName { get; set; }

        [Required]
        [DefaultValue(1)]
        public int TotalCapacity { get; set; }

        public string? Specification { get; set; }
    }

    public class HallResponseDto
    {
        public int Id { get; set; }
        public string LibraryName { get; set; }
        public string HallName { get; set; }
        public int TotalCapacity { get; set; }
        public int TakenCapacity { get; set; }
        public string? Specification { get; set; }
    }
}
