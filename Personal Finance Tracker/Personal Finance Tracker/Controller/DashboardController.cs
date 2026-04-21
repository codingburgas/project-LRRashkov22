using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Personal_Finance_Tracker.Models.CategoryDto;
using Personal_Finance_Tracker.Services.Analytics;
using Personal_Finance_Tracker.Services.CategoryService;
using Personal_Finance_Tracker.Services.DashboardService;
using System.Security.Claims;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Personal_Finance_Tracker.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService dashboardService;
        private readonly ICategoryService categoryService;
        public DashboardController(IDashboardService dashboardService, ICategoryService categoryService)
        {
            this.dashboardService = dashboardService;
            this.categoryService = categoryService;
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await dashboardService.GetDashboardAsync(userId);

            return Ok(result);
        }
        [Authorize]
        [HttpGet("chart")]
        public async Task<IActionResult> GetChart(int days = 7, string mode="daily")
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var data = await dashboardService.GetChartData(userId, days, mode);

            return Ok(data);
        }
        [HttpPut("budget")]
        [Authorize]
        public async Task<ActionResult> AddBudgetLimitByUserAsync([FromBody] SetBudgetDto req)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var (data, error) = await categoryService.AddCategoryBudgetByUser(userId, req);

            if (error != null)
                return BadRequest(error);

            return Ok();
        }
    }
}
