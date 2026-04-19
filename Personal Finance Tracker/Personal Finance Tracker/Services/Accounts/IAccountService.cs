using Personal_Finance_Tracker.Models.Entities;
using Personal_Finance_Tracker.Models.AccountDto;
namespace Personal_Finance_Tracker.Services.Accounts
{
    public interface IAccountService
    {
        Task<(Account? account, string? error)> CreateAccount(AccountDto request, int userId);
        Task<(List<Account> accounts, string? error)> GetAccounts(int userId);
        Task<(Account? account, string? error)> UpdateAccount(AccountDto request, int userId);
        Task<(bool success, string? error)> DeleteAccount(int accountId, int userId);
    }
}
