using ISTTP_lab_2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ISTTP_lab_2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            return await _context.Reviews
                .Include(r => r.Reviewer) 
                .Include(r => r.Reviewee) 
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Contract)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null) return NotFound();

            return review;
        }

        [HttpPost]
        public async Task<ActionResult<Review>> PostReview(Review review)
        {
            review.CreatedAt = DateTime.UtcNow;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}