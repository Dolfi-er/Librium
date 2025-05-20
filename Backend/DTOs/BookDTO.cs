using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Project.Backend.DTOs
{
    public class BookCreateDto
    {
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

        [Required]
        public List<int> AuthorIds { get; set; }
    }

    public class BookUpdateDto
    {
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

        [Required]
        public List<int> AuthorIds { get; set; }
    }

    public class BookResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime? PublishDate { get; set; }
        public string ISBN { get; set; }
        public DateTime AddmissionDate { get; set; }
        public int Quantity { get; set; }
        public float Rating { get; set; }
        public List<int> AuthorIds { get; set; }
    }
}