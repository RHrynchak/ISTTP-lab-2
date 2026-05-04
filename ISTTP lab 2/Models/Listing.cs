using ISTTP_lab_2.Enums;

namespace ISTTP_lab_2.Models
{
    public class Listing
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ListingType Type { get; set; }
        public int StartMMR { get; set; }
        public int TargetMMR { get; set; }
        public int Price { get; set; }
        public ListingStatus Status { get; set; }
        public string Comment { get; set; } = string.Empty;

        public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    }
}
