using ISTTP_lab_2.Enums;
using Microsoft.AspNetCore.Mvc.ViewEngines;

namespace ISTTP_lab_2.Models
{
    public class Contract
    {
        public int Id { get; set; }

        public int ClientId { get; set; }
        public User? Client { get; set; } = null!;

        public int BoosterId { get; set; }
        public User? Booster { get; set; } = null!;

        public int Price { get; set; }
        public int StartMMR { get; set; }
        public int TargetMMR { get; set; }
        public ContractStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
