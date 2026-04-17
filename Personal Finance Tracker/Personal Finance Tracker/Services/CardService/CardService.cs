using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models.CardDto;
using Personal_Finance_Tracker.Models.Entities;
namespace Personal_Finance_Tracker.Services.CardManage;

public class CardService(UserDbContext context) : ICardService
{
    public async Task<(Account? card, string error)> CreateCard(CardDto request)
    {
        if (string.IsNullOrWhiteSpace(request.CardHolderName))
            return (null, "Card holder name is required");

        if (request.CardHolderName.Length < 3 || request.CardHolderName.Length > 20)
            return (null, "Card holder name must be between 3 and 20 characters");

        if (string.IsNullOrWhiteSpace(request.MaskedCardNumber))
            return (null, "Card number is required");

        if (request.MaskedCardNumber.Length != 16 || !request.MaskedCardNumber.All(char.IsDigit))
            return (null, "Card number must be exactly 16 digits");

        if (!DateTime.TryParse(request.Expiry, out var expiryDate))
            return (null, "Invalid expiry date format");

        if (expiryDate < DateTime.UtcNow)
            return (null, "Card is expired");

        if (string.IsNullOrWhiteSpace(request.CVV))
            return (null, "CVV is required");

        if (request.CVV.Length != 3 || !request.CVV.All(char.IsDigit))
            return (null, "CVV must be exactly 3 digits");
        var card = new Account
        {
            CardHolderName = request.CardHolderName,
            CardNumber = request.MaskedCardNumber,
            ExpiryDate = expiryDate,
            Balance = request.Balance,

        };
        context.Cards.Add(card);
        await context.SaveChangesAsync();
        return (card, string.Empty);
    }
}

