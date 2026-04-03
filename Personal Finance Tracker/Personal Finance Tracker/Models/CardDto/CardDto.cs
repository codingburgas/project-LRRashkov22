namespace Personal_Finance_Tracker.Models.CardDto
{
    public class CardDto
    {
        public int Id { get; set; }

        public string CardHolderName { get; set; } = string.Empty;

        public string MaskedCardNumber { get; set; } = string.Empty;
        // пример: **** **** **** 1234

        public string Expiry { get; set; } = string.Empty;
        // пример: 08/28
        public string CVV { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        //public string CardNumber { get; set; } = string.Empty;
    }
}
