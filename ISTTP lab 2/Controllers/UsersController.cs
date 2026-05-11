using ISTTP_lab_2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ISTTP_lab_2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Listings)
                .Include(u => u.Proposals)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] User updatedData)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();


            user.Username = updatedData.Username;
            user.Email = updatedData.Email;
            user.PreferredPosition = updatedData.PreferredPosition;
            user.MMR = updatedData.MMR;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict("Неможливо видалити користувача, оскільки він має активні контракти, пропозиції або відгуки. Спочатку видаліть або закрийте їх.");
            }

            return NoContent();
        }
    }
}