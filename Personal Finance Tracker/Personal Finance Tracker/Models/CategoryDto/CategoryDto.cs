namespace Personal_Finance_Tracker.Models.CategoryDto
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal BudgetLimit { get; set; }
    }
}
