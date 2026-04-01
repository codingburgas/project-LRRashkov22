namespace Personal_Finance_Tracker.Models.UserDto
{
    public class TokenResponseDto
    {
        public required string  AccessToken { get; set; }
        public required string  RefreshToken { get; set; }
    }
}
