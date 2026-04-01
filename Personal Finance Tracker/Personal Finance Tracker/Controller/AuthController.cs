using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Models.UserDto;
using Microsoft.AspNetCore.Identity;
using Personal_Finance_Tracker.Services;
using Microsoft.AspNetCore.Authorization;

namespace Personal_Finance_Tracker.Controller;

[Route("api/[controller]")]
[ApiController]

public class AuthController(IAuthService AuthService) : ControllerBase {
    public static User user = new();
    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(UserDto request) {
        var user = await AuthService.RegisterAsync(request);
        if(user == null) return BadRequest("User already exists");
        return Ok(user);
    }
    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> login(UserDto request)
    {
     var result =  await AuthService.LoginAsync(request);
        if(result is null) return BadRequest("Invalid username or password");
        return Ok(result);
    }
    [Authorize]
    [HttpGet]
    public IActionResult AuthenticatedOnlyEndpoint() { 
    return Ok("You are authenticated and can access this endpoint.");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("Admin-only")]
    public IActionResult AdminOnlyEndpoint ()
    {
        return Ok("You are Admin.");
    }
    [HttpPost("refresh-token")]
    public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto requestDto) { 
    var result = await AuthService.RefreshTokensAsync(requestDto);
    if(result is null) return Unauthorized("Invalid refresh token");
    return Ok(result);  
}
}


