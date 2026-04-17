namespace Personal_Finance_Tracker.Models.CategoryDto
{
    public class CreateCategoryDto
    {
        public int userId { get; set; }
        public bool IsIncome { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal BudgetLimit { get; set; }
    }
}
