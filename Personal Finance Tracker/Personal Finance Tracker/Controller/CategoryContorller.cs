using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Personal_Finance_Tracker.Models.CategoryDto;
using Personal_Finance_Tracker.Models.Entities;
using Personal_Finance_Tracker.Services.CategoryService;
using System.Security.Claims;
namespace Personal_Finance_Tracker.Controller
{
    [Route("api/categories")]
    [ApiController]
    public class CategoryContorller : ControllerBase
    {
        private readonly ICategoryService category;
        public CategoryContorller(ICategoryService category)
        {
            this.category = category;
        }

        
        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetCategory()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            // var (cat, error) = await category.GetCategory(userId);
            var (cat, error) = await category.GetCategory(userId);
            if (error != null) return BadRequest(error);
            return Ok(cat);
        }

        [Authorize]
        [HttpGet("defaults")]
        public async Task<ActionResult> GetDefaultCategoriess()
        {
            var categories = await category.GetDefaultCategories();

            return Ok(categories);
        }

        [Authorize]
        [HttpGet("setup-status")]
        public async Task<ActionResult> GetSetupStatus()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var done = await category.HasCompletedSetup(userId);

            return Ok(done);
        }
        [Authorize]
        [HttpGet("with-budgets")]
        public async Task<IActionResult> GetCategoriesWithBudgetsAsync(int month, int year)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var (result, error) = await category.GetCategoriesWithBudgets(userId, month, year);  
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("defaults-admin")]
        public async Task<ActionResult> GetDefaultsAdmin()
        {
            var categories = await category.GetDefaultCategories();
            return Ok(categories);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("default")]
        public async Task<ActionResult> CreateDefaultCategoryAdmin(CreateCategoryAdminDto request)
        {
            var (cat, error) = await category.CreateDefaultCategory(request);

            if (error != null)
                return BadRequest(error);

            return Ok(cat);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> CreateCategoryUser(CreateCategoryDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var (cat, error) = await category.CreateUserCategory(request, userId);

            if (error != null)
                return BadRequest(error);

            return Ok(cat);
        }

        [Authorize]
        [HttpPost("setup")]
        public async Task<ActionResult> SetupCategories([FromBody] CategorySetupDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var (success, error) = await category.SetupUserCategories(userId, request);

            if (!success)
                return BadRequest(error);

            return Ok();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id,CategoryDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            request.Id = id;

            var (cat, error) = await category.UpdateCategoryAdminOnly(request, userId);

            if (error != null)
                return BadRequest(error);

            return Ok(cat);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var dto = new CategoryDto { Id = id };

            var (cat, error) = await category.DeleteCategoryAdminOnly(dto, userId);

            if (error != null)
                return BadRequest(error);

            return Ok("Deleted");
        }

    }
}
