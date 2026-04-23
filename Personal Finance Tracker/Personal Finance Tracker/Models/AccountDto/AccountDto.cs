using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Personal_Finance_Tracker.Models.Entities;

namespace Personal_Finance_Tracker.Models.AccountDto
{
    public class AccountDto
    {
        public string Name { get; set; } = string.Empty;
        public TypeAccount? AccountType { get; set; }
        public int? UserId { get; set; }
        public decimal Balance { get; set; }
        public int accountId { get; set; }
    }
}
