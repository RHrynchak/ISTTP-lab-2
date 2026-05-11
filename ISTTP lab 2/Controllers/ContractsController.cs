using ISTTP_lab_2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ISTTP_lab_2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContractsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contract>>> GetContracts()
        {
            return await _context.Contracts
                .Include(c => c.Client)
                .Include(c => c.Booster)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Contract>> GetContract(int id)
        {
            var contract = await _context.Contracts
                .Include(c => c.Client)
                .Include(c => c.Booster)
                .Include(c => c.Reviews)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contract == null) return NotFound();

            return contract;
        }

        [HttpPost]
        public async Task<ActionResult<Contract>> PostContract(Contract contract)
        {
            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ISTTP_lab_2.Enums.ContractStatus newStatus)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null) return NotFound();

            contract.Status = newStatus;

            if (newStatus == ISTTP_lab_2.Enums.ContractStatus.Completed)
            {
                contract.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}