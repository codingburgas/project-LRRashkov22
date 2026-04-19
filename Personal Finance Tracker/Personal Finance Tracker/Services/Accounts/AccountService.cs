using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models.AccountDto;
using Personal_Finance_Tracker.Models.Entities;

namespace Personal_Finance_Tracker.Services.Accounts;

public class AccountService : IAccountService
{
        private readonly UserDbContext context;
        public AccountService(UserDbContext context)
        {
            this.context = context;
        }
        public async Task<(Account? account, string? error)> CreateAccount(AccountDto request, int userId) 
        {
            if (string.IsNullOrWhiteSpace(request.Name)) return (null, "Name cannot be empty");
            if (request.AccountType == null) return (null, "Account type is required");
            var account = new Account
            {
                Name = request.Name,
                AccountType = request.AccountType,
                Balance = 0,
                UserId = userId,
            };
            context.Accounts.Add(account);
            await context.SaveChangesAsync();
            return (account, null);
        }

        public async Task<(List<Account> accounts, string? error)> GetAccounts(int userId) 
        {
            var accounts = await context.Accounts.Where(a => a.UserId == userId).ToListAsync();
            if (!accounts.Any()) return (accounts, null);
            return (accounts, null);
        }

        public async Task<(Account? account, string? error)> UpdateAccount(AccountDto request, int userId) 
        {
        var income = await context.Transactions
        .Where(t => t.AccountId == request.accountId && t.UserId == userId && t.IsIncome)
        .SumAsync(t => t.Amount);
        var expense = await context.Transactions
        .Where(t => t.AccountId == request.accountId && t.UserId == userId && !t.IsIncome)
        .SumAsync(t => t.Amount);
        var balance = income - expense;
            if (string.IsNullOrWhiteSpace(request.Name)) return (null, "Name cannot be empty");
            if (request.Balance < 0) return (null, "Balance cannot be negative");
            if (request.AccountType == null) return (null, "Account type is required");
            var account = await context.Accounts.FirstOrDefaultAsync(a => a.Id == request.accountId && a.UserId == userId);
            if (account == null) return (null, "Account not found");
            account.Name = request.Name;
            account.AccountType = request.AccountType;
            account.Balance = balance;
            await context.SaveChangesAsync();
            return (account, null);
        }

        public async Task<(bool success, string? error)> DeleteAccount(int accountId, int userId)
        {
            var account = await context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);
            if (account == null) return (false, "Account not found");
            context.Accounts.Remove(account);
            await context.SaveChangesAsync();
            return (true, null);
        }

}