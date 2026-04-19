using System.ComponentModel.DataAnnotations;

namespace Personal_Finance_Tracker.Models.Entities
{
   public enum TypeAccount
    {
        CreditCard,
        DebitCard,
        BankAccount,
        InvestmentAccount,
        WalletAccount,
    }
    public class Account : BaseEntity
    {
        [Required]
      public string Name { get; set; } = string.Empty;

        [Required]
        public TypeAccount? AccountType { get; set; }
        public decimal Balance { get; set; }
        public int? UserId { get; set; }
        public User? User { get; set; } = null!;

        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
