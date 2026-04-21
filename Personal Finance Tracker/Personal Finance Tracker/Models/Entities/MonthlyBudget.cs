namespace Personal_Finance_Tracker.Models.Entities
{
    public class MonthlyBudget
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public int CategoryId { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        public decimal Amount { get; set; }

        public Category Category { get; set; }
    }
}
