using System.ComponentModel.DataAnnotations.Schema;

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
        [InverseProperty("Client")]
        public ICollection<Contract> ContractsAsClient { get; set; } = new List<Contract>();

        [InverseProperty("Booster")]
        public ICollection<Contract> ContractsAsBooster { get; set; } = new List<Contract>();
        [InverseProperty("Reviewer")]
        public ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();

        [InverseProperty("Reviewee")]
        public ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    }
}