using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Models.CategoryDto;
using System.Threading.Tasks;
namespace Personal_Finance_Tracker.Services.CategoryService
{
    public interface ICategoryService
    {
        Task<(Category? cat, string? error)> CreateCategoryAdminOnly(CreateCategoryDto request);
        Task<(List<Category> cat, string? error)> GetCategory();
        Task<(Category? cat, string? error)> UpdateCategoryAdminOnly(CategoryDto request);
        Task<(Category? cat, string? error)> DeleteCategoryAdminOnly(CategoryDto request);

    }
}

