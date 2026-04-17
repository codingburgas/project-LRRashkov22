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

        [HttpGet("defaults")]
        [Authorize]
        public async Task<ActionResult> GetDefaultCategories()
        {
            var categories = await category.GetDefaultCategories();

            return Ok(categories);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> CreateCategory(CreateCategoryDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var (cat, error) = await category.CreateCategoryAdminOnly(request, userId);
            if (error != null) return BadRequest(error);
            return Ok(cat);
        }
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCategory(int id,CategoryDto request)
        {
            request.Id = id;

            var (cat, error) = await category.UpdateCategoryAdminOnly(request);

            if (error != null)
                return BadRequest(error);

            return Ok(cat);
        }
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var dto = new CategoryDto { Id = id };

            var (cat, error) = await category.DeleteCategoryAdminOnly(dto);

            if (error != null)
                return BadRequest(error);

            return Ok("Deleted");
        }

        //-----------------------------------------------------------------------------------

        [HttpGet("setup-status")]
        [Authorize]
        public async Task<ActionResult> GetSetupStatus()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var done = await category.HasCompletedSetup(userId);

            return Ok(done);
        }

        [HttpPost("setup")]
        [Authorize]
        public async Task<ActionResult> SetupCategories([FromBody] CategorySetupDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var (success, error) = await category.SetupUserCategories(userId, request);

            if (!success)
                return BadRequest(error);

            return Ok();
        }

    }
}
