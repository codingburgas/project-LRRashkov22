using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Models.UserDto;
using System.Threading.Tasks;
namespace Personal_Finance_Tracker.Services.Auth
{
    public interface IAuthService
    {
       Task<(User? user, string? error)> RegisterAsync(UserDto request);
        Task<(TokenResponseDto? tokenRespone, string? error)> LoginAsync(UserDto request);
        Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request);
    }
}
