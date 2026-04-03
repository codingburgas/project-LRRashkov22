namespace Personal_Finance_Tracker.Models
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public decimal BudgetLimit { get; set; }     
        public int? UserId { get; set; } 
        public User? User { get; set; }
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
