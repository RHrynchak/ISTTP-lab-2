using ISTTP_lab_2.Models;
using ISTTP_lab_2.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ISTTP_lab_2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProposalsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProposalsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Proposal>>> GetProposals()
        {
            return await _context.Proposals
                .Include(p => p.User)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Proposal>> GetProposal(int id)
        {
            var proposal = await _context.Proposals
                .Include(p => p.User)
                .Include(p => p.Listing)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (proposal == null) return NotFound();

            return proposal;
        }

        [HttpPost]
        public async Task<ActionResult<Proposal>> PostProposal(Proposal proposal)
        {
            _context.Proposals.Add(proposal);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProposal), new { id = proposal.Id }, proposal);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ProposalStatus newStatus)
        {
            var proposal = await _context.Proposals.FindAsync(id);
            if (proposal == null) return NotFound();

            proposal.Status = newStatus;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/details")]
        public async Task<IActionResult> UpdateProposalDetails(int id, [FromBody] Proposal updatedData)
        {
            var proposal = await _context.Proposals.FindAsync(id);
            if (proposal == null) return NotFound();
            if (proposal.Status != ProposalStatus.Pending)
            {
                return BadRequest("Неможливо змінити пропозицію, яка вже була прийнята або відхилена.");
            }

            proposal.Price = updatedData.Price;
            proposal.Comment = updatedData.Comment;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProposal(int id)
        {
            var proposal = await _context.Proposals.FindAsync(id);
            if (proposal == null) return NotFound();

            _context.Proposals.Remove(proposal);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}