using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Personal_Finance_Tracker.Services.CategoryService;
using Microsoft.AspNetCore.Authorization;
using Personal_Finance_Tracker.Models.CategoryDto;
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
            var (cat, error) = await category.GetCategory();
            if (error != null) return BadRequest(error);
            return Ok(cat);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult> CreateCategory(CreateCategoryDto request)
        {
            var (cat, error) = await category.CreateCategoryAdminOnly(request);
            if (error != null) return BadRequest(error);
            return Ok(cat);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id,CategoryDto request)
        {
            request.Id = id;

            var (cat, error) = await category.UpdateCategoryAdminOnly(request);

            if (error != null)
                return BadRequest(error);

            return Ok(cat);
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var dto = new CategoryDto { Id = id };

            var (cat, error) = await category.DeleteCategoryAdminOnly(dto);

            if (error != null)
                return BadRequest(error);

            return Ok("Deleted");
        }

    }
}
