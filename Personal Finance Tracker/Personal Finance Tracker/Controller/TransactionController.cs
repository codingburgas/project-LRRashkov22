using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Personal_Finance_Tracker.Services.TransactionService;
using Personal_Finance_Tracker.Services.CategoryService;
using Microsoft.AspNetCore.Authorization;
using Personal_Finance_Tracker.Models.TransactionDto;
using System.Security.Claims;
namespace Personal_Finance_Tracker.Controller;

[Route("api/[controller]")]
[ApiController]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService transaction;
    public TransactionController(ITransactionService transaction)
    {
        this.transaction = transaction;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult> CreateTransactionAsync([FromBody] CreateTransactionDto request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();
        int userId = int.Parse(userIdClaim.Value);
        var (transactionResult, error) = await transaction.CreateTransaction(request, userId);
        if (error != null)
            return BadRequest(error);
        return Ok(transactionResult);
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetTransactionsAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        var result = await transaction.GetTransactionsByUserIdAsync(userId);

        return Ok(result);
    }

    [Authorize]
    [HttpGet("recent")]
    public async Task<ActionResult> GetRecentTransactionsAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        var result = await transaction.GetRecentTransactionsAsync(userId);

        return Ok(result);
    }
}

