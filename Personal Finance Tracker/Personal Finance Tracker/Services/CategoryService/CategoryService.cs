using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models.CategoryDto;
using Personal_Finance_Tracker.Models.Entities;
using System.Threading.Tasks;
namespace Personal_Finance_Tracker.Services.CategoryService;

public class CategoryService : ICategoryService
{
    private readonly UserDbContext context;

    public CategoryService(UserDbContext context)
    {
        this.context = context;
    }

    public async Task<(List<Category> cat, string? error)> GetCategory(int userId)
    {
        var categories = await context.Categories
        //.Where(c => c.UserId == userId || c.UserId == null)
        .Where(c => c.UserId == userId)
        .ToListAsync();
        await context.Categories.ToListAsync();
        Console.WriteLine($"Categories count: {categories.Count}");
        if (!categories.Any())
            return (new List<Category>(), null);

        return (categories, null);
    }
    public async Task<List<Category>> GetDefaultCategories()
    {
        var categories = await context.Categories
            .Where(c => c.UserId == null)
            .ToListAsync();

        return categories;
    }
    public async Task<(Category? cat, string? error)> CreateCategoryAdminOnly(CreateCategoryDto request, int userId)
    {
        if (string.IsNullOrEmpty(request.Name)) return (null, "Category name cannot be null");
        if (await context.Categories.AnyAsync(cat => cat.Name == request.Name && cat.UserId == request.userId)) return (null, "Category name already exists");
        if (request.BudgetLimit < 0) return (null, "Budget limit cannot be negative");
        var category = new Category
        {
            Name = request.Name,
            BudgetLimit = request.BudgetLimit,
            IsIncome = request.IsIncome,
            UserId = userId
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        return (category, null);
    }

    public async Task<(Category? cat, string? error)> AddCategoryBudgetByUser(int userId, SetBudgetDto request)
    {
        if (request.Amount < 0)return (null, "Budget limit cannot be negative");
        var category = await context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId);
        if (category == null) return (null, "Category not found");
        category.BudgetLimit = request.Amount;
        await context.SaveChangesAsync();
        return (category, null);
    }

    public async Task<(Category? cat, string? error)> UpdateCategoryAdminOnly(CategoryDto request)
    {
            if (request.BudgetLimit < 0) return (null, "Budget limit cannot be negative");
            if (string.IsNullOrEmpty(request.Name)) return (null, "Category name cannot be null");
           
            var category = await context.Categories.FindAsync(request.Id);

            if (category == null)
                return (null, "Category not found");

            category.Name = request.Name;
            category.BudgetLimit = request.BudgetLimit;
            category.IsIncome = request.IsIncome;

            await context.SaveChangesAsync();
            return (category, null);    
    }

    public async Task<(Category? cat, string? error)> DeleteCategoryAdminOnly(CategoryDto request) { 
        var category = await context.Categories.FindAsync(request.Id);
        if (category == null)
            return (null, "Category not found");

        context.Categories.Remove(category);
        await context.SaveChangesAsync();
        return (null, null);
    }
    //-----------------------------------------------------------------------------------------------------------------
    public async Task<(bool success, string? error)> SetupUserCategories(int userId, CategorySetupDto request)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return (false, "User not found");

        if (user.HasCompletedCategorySetup)
            return (false, "Already completed");

        // 🔥 1. взимаме default категории
        var defaultCategories = await context.Categories
            .Where(c => c.UserId == null && request.DefaultCategoryIds.Contains(c.Id))
            .ToListAsync();

        // 🔥 2. копираме ги към user
        foreach (var c in defaultCategories)
        {
            context.Categories.Add(new Category
            {
                Name = c.Name,
                IsIncome = c.IsIncome,
                BudgetLimit = c.BudgetLimit, // може и 0 ако искаш
                UserId = userId
            });
        }

        // 🔥 3. custom категории
        foreach (var custom in request.CustomCategories)
        {
            context.Categories.Add(new Category
            {
                Name = custom.Name,
                IsIncome = custom.IsIncome,
                BudgetLimit = custom.BudgetLimit,
                UserId = userId
            });
        }

        // 🔥 4. маркираме user като setup-нат
        user.HasCompletedCategorySetup = true;

        await context.SaveChangesAsync();

        return (true, null);
    }
    public async Task<bool> HasCompletedSetup(int userId)
    {
        return await context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.HasCompletedCategorySetup)
            .FirstOrDefaultAsync();
    }
}
