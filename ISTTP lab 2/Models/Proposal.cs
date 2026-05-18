using ISTTP_lab_2.Enums;

namespace ISTTP_lab_2.Models
{
    public class Proposal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; } = null!;

        public int ListingId { get; set; }
        public Listing? Listing { get; set; } = null!;

        public int Price { get; set; }
        public ProposalStatus Status { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
