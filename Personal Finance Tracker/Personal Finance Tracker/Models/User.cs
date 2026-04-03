using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;
namespace Personal_Finance_Tracker.Models;

public class User : BaseEntity
{
    [Required]
    [Length(3, 20)]
    [RegularExpression(@"^[a-zA-Z]$",
         ErrorMessage = "Characters are not allowed.")]
    public string Username { get; set; } = string.Empty;
    [Required]
    [Length(8, 30)]
    public string PasswordHash { get; set; } = string.Empty;
    [Required]
    public string Role { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public DateTime? LockEnd { get; set; }
    public int? FailedAttempts { get; set; } = 0;
    public ICollection<Card> Cards { get; set; } = new List<Card>();

}

