using System.ComponentModel.DataAnnotations;

namespace Personal_Finance_Tracker.Models.Entities
{
    public class Card : BaseEntity
    {
        [Required]
        [StringLength(16, MinimumLength = 16)]
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string CardHolderName { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiryDate { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string CVV { get; set; } = string.Empty;

        public decimal Balance { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
