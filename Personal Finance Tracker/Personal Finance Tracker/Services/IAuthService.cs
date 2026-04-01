using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Models.UserDto;

namespace Personal_Finance_Tracker.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto request);
        Task<TokenResponseDto?> LoginAsync(UserDto request);
        Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request);
    }
}
