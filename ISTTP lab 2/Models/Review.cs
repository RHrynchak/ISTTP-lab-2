namespace ISTTP_lab_2.Models
{
    public class Review
    {
        public int Id { get; set; }

        public int ContractId { get; set; }
        public Contract? Contract { get; set; } = null!;

        public int ReviewerId { get; set; }
        public User? Reviewer { get; set; } = null!;

        public int RevieweeId { get; set; }
        public User? Reviewee { get; set; } = null!;

        public int Score { get; set; } 
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
