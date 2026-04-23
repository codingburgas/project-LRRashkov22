using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models.CategoryDto;
using Personal_Finance_Tracker.Models.Entities;
using Personal_Finance_Tracker.Services.Auth;
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

    public async Task<(List<CategoryWithBudgetDto>? cat, string? error)> GetCategoriesWithBudgets(int userId, int month, int year)
    {
        var categories = await context.Categories
            .Where(c => c.UserId == userId)
            .ToListAsync();

        var budgets = await context.MonthlyBudgets
            .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
            .ToListAsync();

        var result = categories.Select(c => new CategoryWithBudgetDto
        {
            Id = c.Id,
            Name = c.Name,
            IsIncome = c.IsIncome,
            Budget = budgets.FirstOrDefault(b => b.CategoryId == c.Id)?.Amount ?? 0
        }).ToList();

        return (result, null);
    }

    public async Task<(Category? cat, string? error)> CreateUserCategory(CreateCategoryDto request, int userId)
    {
        if (DemoGuard.IsDemo(userId)) return (null, "Demo account is read-only. Create one to use full app");
        if (string.IsNullOrEmpty(request.Name)) return (null, "Category name cannot be null");
        if (await context.Categories.AnyAsync(cat => cat.Name == request.Name && cat.UserId == userId)) return (null, "Category name already exists");
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

    public async Task<(Category? cat, string? error)> CreateDefaultCategory(CreateCategoryAdminDto request)
    {
        if (string.IsNullOrEmpty(request.Name))
            return (null, "Category name cannot be null");

        var exists = await context.Categories
            .AnyAsync(c => c.Name == request.Name && c.UserId == null);

        if (exists)
            return (null, "Default category already exists");

        var category = new Category
        {
            Name = request.Name,
            BudgetLimit = request.BudgetLimit,
            IsIncome = request.IsIncome,
            UserId = null
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        return (category, null);
    }

    public async Task<(Category? cat, string? error)> AddCategoryBudgetByUser(int userId, SetBudgetDto request)
    {
        if (DemoGuard.IsDemo(userId)) return (null, "Demo account is read-only. Create one to use full app");
        var existing = await context.MonthlyBudgets
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.CategoryId == request.CategoryId &&
                x.Month == request.Month &&
                x.Year == request.Year);

        if (existing != null)
        {
            existing.Amount = request.Amount;
        }
        else
        {
            context.MonthlyBudgets.Add(new MonthlyBudget
            {
                UserId = userId,
                CategoryId = request.CategoryId,
                Month = request.Month,
                Year = request.Year,
                Amount = request.Amount
            });
        }
        var category = await context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.UserId == userId);

        await context.SaveChangesAsync();

        return (category, null);
    }

    public async Task<(Category? cat, string? error)> UpdateCategoryAdminOnly(CategoryDto request, int userId)
    {
        if (DemoGuard.IsDemo(userId)) return (null, "Demo account is read-only. Create one to use full app");

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

    public async Task<(Category? cat, string? error)> DeleteCategoryAdminOnly(CategoryDto request, int userId)
    {
        if (DemoGuard.IsDemo(userId)) return (null, "Demo account is read-only. Create one to use full app");
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
        if (DemoGuard.IsDemo(userId)) return (false, "Demo account is read-only. Create pne to use full app");
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return (false, "User not found");

        if (user.HasCompletedCategorySetup)
            return (false, "Already completed");

        var defaultCategories = await context.Categories
            .Where(c => c.UserId == null && request.DefaultCategoryIds.Contains(c.Id))
            .ToListAsync();

        foreach (var c in defaultCategories)
        {
            context.Categories.Add(new Category
            {
                Name = c.Name,
                IsIncome = c.IsIncome,
                BudgetLimit = c.BudgetLimit,
                UserId = userId
            });
        }

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
