using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Models.UserDto;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Personal_Finance_Tracker.Services;

    public class AuthService(UserDbContext context, IConfiguration configuration) : IAuthService
{
    //Register-------------------------------------------------------------------
    public async Task<User?> RegisterAsync(UserDto request)
    {
        if (await context.Users.AnyAsync(u => u.Username == request.Username))
        {
            return null;
        }
        var user = new User();
        var hashedPassword = new PasswordHasher<User>()
            .HashPassword(user, request.Password);
        user.Username = request.Username;
        user.PasswordHash = hashedPassword;
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }
    //Register-------------------------------------------------------------------

    //Login----------------------------------------------------------------------
    public async Task<TokenResponseDto?> LoginAsync(UserDto request)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null)
        {
            return null;
        }
        if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password)
            == PasswordVerificationResult.Failed)
        {
            return null;
        }
        
        return await CreateTokenResponse(user);
    }
    //Login----------------------------------------------------------------------

    //Create Token---------------------------------------------------------------
    private string CreateToken(User user)
    {
        var claims = new List<Claim> {
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
        new Claim(ClaimTypes.Role, user.Role)
      };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
        var tokenDescriptor = new JwtSecurityToken(
            issuer: configuration.GetValue<string>("AppSettings:Issuer"),
            audience: configuration.GetValue<string>("AppSettings:Audience"),
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
);
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }
    //Create Token---------------------------------------------------------------

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        Console.ForegroundColor = ConsoleColor.Red;

        // Print the red text
        Console.WriteLine(randomNumber);

        // Reset the console color to default
        Console.ResetColor();
        
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
    {
        var refreshToken = GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await context.SaveChangesAsync();
        return refreshToken;
    }

    private async Task<User?> ValidateRefreshTokenAsync(Guid userId, string refreshToken) {
        var user = await context.Users.FindAsync(userId);
        if (user is null || user.RefreshToken != refreshToken
            || user.RefreshTokenExpiryTime <= DateTime.UtcNow) return null;
        return user;
    }
    public async Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request)
    {
       var user = await  ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
        if (user is null) return null;

       return await CreateTokenResponse(user);
    }



    //Token Response-------------------------------------------------------------
    //Used in both Login and Refresh TokenS methods 
    private async Task<TokenResponseDto> CreateTokenResponse(User user)
    {
        return new TokenResponseDto
        {
            AccessToken = CreateToken(user),
            RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
        };
    }
    //Token Response-------------------------------------------------------------
}

