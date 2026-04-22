namespace Personal_Finance_Tracker.Models.CategoryDto
{
    public class CategoryWithBudgetDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsIncome { get; set; }
        public decimal Budget { get; set; }
    }
}
