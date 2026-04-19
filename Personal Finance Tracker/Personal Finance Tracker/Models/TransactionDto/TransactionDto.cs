using Personal_Finance_Tracker.Models.Entities;

namespace Personal_Finance_Tracker.Models.TransactionDto
{
    public class TransactionDto
    {
        public int Id { get; set; } 
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public DateTime? TransactionDate  { get; set; }
        public bool IsIncome { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public int AccountId { get; set; }
    }
}
