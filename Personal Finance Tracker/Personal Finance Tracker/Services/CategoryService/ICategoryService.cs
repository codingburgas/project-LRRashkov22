using Personal_Finance_Tracker.Models.CategoryDto;
using Personal_Finance_Tracker.Models.Entities;
using System.Threading.Tasks;
namespace Personal_Finance_Tracker.Services.CategoryService;

public interface ICategoryService
{
    Task<(Category? cat, string? error)> CreateDefaultCategory(CreateCategoryAdminDto request);
    Task<(Category? cat, string? error)> CreateUserCategory(CreateCategoryDto request, int userId);
    Task<(List<Category> cat, string? error)> GetCategory(int userId);
    Task<(Category? cat, string? error)> UpdateCategoryAdminOnly(CategoryDto request, int userId);
    Task<(Category? cat, string? error)> DeleteCategoryAdminOnly(CategoryDto request, int userId);
    Task<(Category? cat, string? error)> AddCategoryBudgetByUser(int userId, SetBudgetDto request);
    Task<(List<CategoryWithBudgetDto>? cat, string? error)> GetCategoriesWithBudgets(int userId, int month, int year);
    Task<List<Category>> GetDefaultCategories();
    Task<bool> HasCompletedSetup(int userId);
    Task<(bool success, string? error)> SetupUserCategories(int userId, CategorySetupDto request);

}


