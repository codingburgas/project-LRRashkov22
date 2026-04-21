namespace Personal_Finance_Tracker.Models.CategoryDto
{
    public class SetBudgetDto
    {
        public int CategoryId { get; set; }
        public decimal Amount { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }
}
