using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Models.TransactionDto;
namespace Personal_Finance_Tracker.Services.TransactionService;

public interface ITransactionService
{
    Task<(TransactionDto? transaction, string? error)> CreateTransaction(CreateTransactionDto request, int userId);
    Task<List<TransactionDto>> GetTransactionsByUserIdAsync(int userId);
    Task<List<TransactionDto>> GetRecentTransactionsAsync(int userId);
}

