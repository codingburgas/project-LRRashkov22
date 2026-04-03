namespace Personal_Finance_Tracker.Models.CategoryDto
{
    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal BudgetLimit { get; set; }
    }
}
