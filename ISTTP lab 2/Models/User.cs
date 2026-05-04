using System.Reflection;

namespace ISTTP_lab_2.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public int MMR { get; set; }
        public int PreferredPosition { get; set; }
        public float RatingAsBooster { get; set; }
        public float RatingAsPlayer { get; set; }

        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
        public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    }
}
