using Personal_Finance_Tracker.Models.TransactionDto;
using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Data;
using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Models.Entities;
namespace Personal_Finance_Tracker.Services.TransactionService;

    public class TransactionService : ITransactionService
    {
        private readonly UserDbContext context;
        public TransactionService(UserDbContext context) 
        { 
            this.context = context;
        }
        public async Task<(TransactionDto? transaction, string? error)> CreateTransaction(CreateTransactionDto request, int userId)
       {
        if(request.Amount <= 0) return (null, "Amount must be greater than zero.");
        if (string.IsNullOrWhiteSpace(request.Description))  return (null, "Description is required");

        var category = await context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId);
        var account = await context.Accounts
        .FirstOrDefaultAsync(a => a.Id == request.AccountId && a.UserId == userId);

        if (account == null)
            return (null, "Invalid account");
        if (category == null)
            return (null, "Category not found");
        if (category.UserId != null && category.UserId != userId)
            return (null, "Invalid category");

        if (category.IsIncome != request.IsIncome)
            return (null, "Invalid category type");
        if (request.TransactionDate.HasValue && request.TransactionDate > DateTime.UtcNow)
            return (null, "Date cannot be in the future");
        var transaction = new Transaction
        {
            Amount = request.Amount,
            Description = request.Description,
            Date = request.TransactionDate ?? DateTime.UtcNow,
            IsIncome = request.IsIncome,
            CategoryId = request.CategoryId,
            AccountId = request.AccountId,
            UserId = userId
        };

        context.Transactions.Add(transaction);
        if (request.IsIncome)
        {
            account.Balance += request.Amount;
        }
        else
        {
            account.Balance -= request.Amount;
        }
        await context.SaveChangesAsync();

        var result = new TransactionDto
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Description = transaction.Description,
            TransactionDate = transaction.Date,
            CategoryId = transaction.CategoryId,
            IsIncome = transaction.IsIncome,
            CategoryName = category.Name,
            AccountId = transaction.AccountId
        };

        return (result, null);
    }
    public async Task<List<TransactionDto>> GetTransactionsByUserIdAsync(int userId)
    {
        return await context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Take(50)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                TransactionDate = t.Date,
                IsIncome = t.IsIncome,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                AccountId = t.AccountId,
                AccountName = t.Account.Name
            })
            .ToListAsync();
    }
    public async Task<List<TransactionDto>> GetRecentTransactionsAsync(int userId)
    {
        return await context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Take(10)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                TransactionDate = t.Date,
                IsIncome = t.IsIncome,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                AccountId = t.AccountId,
                AccountName = t.Account.Name
            })
            .ToListAsync();
    }

}

