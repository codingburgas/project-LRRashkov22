using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models.DashboardChartDto;
using System.Linq;

namespace Personal_Finance_Tracker.Services.DashboardService
{
    public class DashboardService : IDashboardService
    {
        private readonly UserDbContext context;

        public DashboardService(UserDbContext context)
        {
            this.context = context;
        }

        public async Task<DashboardDto> GetDashboardAsync(int userId) {
            var income = await context.Transactions
        .Where(t => t.UserId == userId && t.IsIncome)
        .SumAsync(t => t.Amount);

            var expenses = await context.Transactions
                .Where(t => t.UserId == userId && !t.IsIncome)
                .SumAsync(t => t.Amount);

            var balance = income - expenses;
            return new DashboardDto
            {
                TotalIncome = income,
                TotalExpenses = expenses,
                Balance = balance
            };
        }
        public async Task<List<DashboardChartDto>> GetChartData(int userId, int days, string mode)
        {
            var fromDate = DateTime.UtcNow.Date.AddDays(-days);

            var transactions = await context.Transactions
                .Where(t => t.UserId == userId && t.Date >= fromDate)
                .ToListAsync();

            // 🔥 DAILY
            if (mode == "daily")
            {
                var grouped = transactions
                    .GroupBy(t => t.Date.Date)
                    .ToDictionary(
                        g => g.Key,
                        g => new
                        {
                            Income = g.Where(x => x.IsIncome).Sum(x => x.Amount),
                            Expense = g.Where(x => !x.IsIncome).Sum(x => x.Amount)
                        });

                var result = new List<DashboardChartDto>();

                decimal Balance = 0; 

                for (int i = 0; i <= days; i++)
                {
                    var date = fromDate.AddDays(i);

                    decimal income = 0;
                    decimal expense = 0;

                    if (grouped.ContainsKey(date))
                    {
                        income = grouped[date].Income;
                        expense = grouped[date].Expense;
                    }

                    Balance += income - expense;

                    result.Add(new DashboardChartDto
                    {
                        Date = date,
                        Label = date.ToString("MMM dd"),
                        Income = income,
                        Expense = expense,
                        Balance = Balance 
                    });
                }

                return result;
            }
            if (mode == "monthly")
            {

                var list = transactions
    .GroupBy(t => new { t.Date.Year, t.Date.Month })
    .Select(g => new DashboardChartDto
    {
        Date = new DateTime(g.Key.Year, g.Key.Month, 1),
        Label = $"{g.Key.Month}/{g.Key.Year}",
        Income = g.Where(x => x.IsIncome).Sum(x => x.Amount),
        Expense = g.Where(x => !x.IsIncome).Sum(x => x.Amount)
    })
    .OrderBy(x => x.Date)
    .ToList();

                decimal runningBalance = 0;

                foreach (var item in list)
                {
                    runningBalance += item.Income - item.Expense;
                    item.Balance = runningBalance;
                }

                return list;
            }

            // 🔥 YEARLY
            if (mode == "yearly")
            {
                var list = transactions
    .GroupBy(t =>  t.Date.Year)
    .Select(g => new DashboardChartDto
    {
        Date = new DateTime(g.Key, 1, 1),
        Label = g.Key.ToString(),
        Income = g.Where(x => x.IsIncome).Sum(x => x.Amount),
        Expense = g.Where(x => !x.IsIncome).Sum(x => x.Amount)
    })
    .OrderBy(x => x.Date)
    .ToList();

                decimal runningBalance = 0;

                foreach (var item in list)
                {
                    runningBalance += item.Income - item.Expense;
                    item.Balance = runningBalance;
                }

                return list;
            }

            return new List<DashboardChartDto>();

           
        }
    }
}
