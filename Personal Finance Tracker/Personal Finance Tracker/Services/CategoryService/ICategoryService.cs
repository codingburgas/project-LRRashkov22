using Personal_Finance_Tracker.Models.CategoryDto;
using Personal_Finance_Tracker.Models.Entities;
using System.Threading.Tasks;
namespace Personal_Finance_Tracker.Services.CategoryService;

    public interface ICategoryService
    {
        Task<(Category? cat, string? error)> CreateCategoryAdminOnly(CreateCategoryDto request, int userId);
        Task<(List<Category> cat, string? error)> GetCategory(int userId);
        Task<(Category? cat, string? error)> UpdateCategoryAdminOnly(CategoryDto request);
        Task<(Category? cat, string? error)> DeleteCategoryAdminOnly(CategoryDto request);
        Task<(Category? cat, string? error)> AddCategoryBudgetByUser(int userId, SetBudgetDto request);
    //-----------------------------------------------------------------------------------------------------------------
        Task<List<Category>> GetDefaultCategories();
        Task<bool> HasCompletedSetup(int userId);
        Task<(bool success, string? error)> SetupUserCategories(int userId, CategorySetupDto request);

    }


