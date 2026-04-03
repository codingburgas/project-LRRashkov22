namespace Personal_Finance_Tracker.Models
{
    public class Transaction : BaseEntity
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public bool IsIncome { get; set; } 
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int CardId { get; set; }
        public Card Card { get; set; } = null!;
    }
}
