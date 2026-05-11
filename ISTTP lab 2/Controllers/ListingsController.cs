using ISTTP_lab_2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ISTTP_lab_2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ListingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Listing>>> GetListings()
        {
            return await _context.Listings
                .Include(l => l.User)
                .Include(l => l.Proposals)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Listing>> GetListing(int id)
        {
            var listing = await _context.Listings
                .Include(l => l.User)
                .Include(l => l.Proposals)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (listing == null) return NotFound();

            return listing;
        }

        [HttpPost]
        public async Task<ActionResult<Listing>> PostListing(Listing listing)
        {
            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetListing), new { id = listing.Id }, listing);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ISTTP_lab_2.Enums.ListingStatus newStatus)
        {
            var listing = await _context.Listings.FindAsync(id);
            if (listing == null) return NotFound();

            listing.Status = newStatus;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/details")]
        public async Task<IActionResult> UpdateListingDetails(int id, [FromBody] Listing updatedData)
        {
            var listing = await _context.Listings.FindAsync(id);
            if (listing == null) return NotFound();
            if (listing.Status != ISTTP_lab_2.Enums.ListingStatus.Open)
            {
                return BadRequest("Редагувати можна лише відкриті оголошення.");
            }

            listing.Price = updatedData.Price;
            listing.StartMMR = updatedData.StartMMR;
            listing.TargetMMR = updatedData.TargetMMR;
            listing.Comment = updatedData.Comment;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}