using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models.AnalyticsDto;
using Personal_Finance_Tracker.Models.CategoryDto;  
using Personal_Finance_Tracker.Models.Entities;
using System.Security.Claims;
namespace Personal_Finance_Tracker.Services.Analytics;

public class AnalyticsService : IAnalyticsService
{
    private readonly UserDbContext context;

    public AnalyticsService(UserDbContext context)
    {
        this.context = context;
    }

    public async Task<List<AnalyticsDto>> GetBudgetByUser(int userId, int month, int year)
    {
        //var categoriesss = await context.Categories.ToListAsync();
        //Console.WriteLine($"All categories: {categoriesss.Count}");

        //var userCategories = categoriesss.Where(c => c.UserId == userId).ToList();
        //Console.WriteLine($"User categories: {userCategories.Count}");

        //var now = DateTime.Now;
        var categories = await context.Categories.Where(c => c.UserId == userId && !c.IsIncome).ToListAsync();
        var transactions = await context.Transactions
        .Where(t => t.UserId == userId &&
        !t.IsIncome &&
        t.Date.Month == month &&
        t.Date.Year == year)
        .ToListAsync();
        var monthlyBudgets = await context.MonthlyBudgets
        .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
        .ToListAsync();
        var result = new List<AnalyticsDto>();

        foreach (var c in categories)
        {
            var spent = transactions.Where(t => t.CategoryId == c.Id).Sum(t => t.Amount);
            //var budget = monthlyBudgets.FirstOrDefault(b => b.CategoryId == c.Id)?.Amount ?? c.BudgetLimit;
            var budget = monthlyBudgets.FirstOrDefault(b => b.CategoryId == c.Id)?.Amount ?? 0;
            result.Add(new AnalyticsDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                BudgetAmount = budget,
                SpentAmount = spent
            });
        }

        return result;
    }

    public async Task<List<AnalyticsDto>> GetTargetByUser(int userId, int month, int year)
    {
        var categories = await context.Categories
            .Where(c => c.UserId == userId && c.IsIncome)
            .ToListAsync();

        var transactions = await context.Transactions
            .Where(t => t.UserId == userId &&
                        t.IsIncome &&
                        t.Date.Month == month &&
                        t.Date.Year == year)
            .ToListAsync();

        var monthlyBudgets = await context.MonthlyBudgets
            .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
            .ToListAsync();

        var result = new List<AnalyticsDto>();

        foreach (var c in categories)
        {
            var spent = transactions
                .Where(t => t.CategoryId == c.Id)
                .Sum(t => t.Amount);

            //var budget = monthlyBudgets.FirstOrDefault(b => b.CategoryId == c.Id)?.Amount ?? c.BudgetLimit;
            var budget = monthlyBudgets.FirstOrDefault(b => b.CategoryId == c.Id)?.Amount ?? 0;
            result.Add(new AnalyticsDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                BudgetAmount = budget,
                SpentAmount = spent
            });
        }

        return result;
    }
    public async Task ResetMonth(int month, int year, int userId)
    {
        var budgets = context.MonthlyBudgets
        .Where(x => x.UserId == userId && x.Month == month && x.Year == year);
        context.MonthlyBudgets.RemoveRange(budgets);
        await context.SaveChangesAsync();
    }
}