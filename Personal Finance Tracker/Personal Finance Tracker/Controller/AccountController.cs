using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Data;
using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Models.AccountDto;
using Personal_Finance_Tracker.Services.Accounts;
using System.Security.Claims;
namespace Personal_Finance_Tracker.Controller;

[Route("api/account")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly IAccountService accountService;
    private readonly UserDbContext context;
    public AccountController(IAccountService accountService, UserDbContext context)
    {
        this.accountService = accountService;
        this.context = context;
    }
    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetAccounts()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var (accounts, error) = await accountService.GetAccounts(userId);
        if (error != null)
            return BadRequest(error);
        return Ok(accounts);
    }
    [Authorize]
    [HttpPost]
    public async Task<ActionResult> CreateAccount(AccountDto request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var (account, error) = await accountService.CreateAccount(request, userId);
        if (error != null)
            return BadRequest(error);
        return Ok(account);
    }
        [Authorize]
        [HttpPut]
        public async Task<ActionResult> UpdateAccount(AccountDto request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var (account, error) = await accountService.UpdateAccount(request, userId);
            if (error != null)
                return BadRequest(error);
            return Ok(account);
    }
    [Authorize]
    [HttpDelete("{accountId}")]
    public async Task<ActionResult> DeleteAccount(int accountId)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var (success, error) = await accountService.DeleteAccount(accountId, userId);
        if (error != null)
            return BadRequest(error);
        return Ok(new { success });
    }






    [HttpPost("sync-balances")]
    public async Task<IActionResult> SyncBalances()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var accounts = await context.Accounts
            .Where(a => a.UserId == userId)
            .ToListAsync();

        foreach (var acc in accounts)
        {
            var income = await context.Transactions
                .Where(t => t.AccountId == acc.Id && t.IsIncome)
                .SumAsync(t => t.Amount);

            var expense = await context.Transactions
                .Where(t => t.AccountId == acc.Id && !t.IsIncome)
                .SumAsync(t => t.Amount);

            acc.Balance = income - expense;
        }

        await context.SaveChangesAsync();

        return Ok("Synced");
    }
}