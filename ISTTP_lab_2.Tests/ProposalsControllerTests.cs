using ISTTP_lab_2.Controllers;
using ISTTP_lab_2.Models;
using ISTTP_lab_2.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ISTTP_lab_2.Tests
{
    public class ProposalsControllerTests
    {
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public async Task PostProposal_ValidObject_ReturnsCreatedAtActionAndAddsToDb()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var controller = new ProposalsController(context);

            var newProposal = new Proposal
            {
                UserId = 2,
                ListingId = 1,
                Price = 100,
                Status = ProposalStatus.Pending,
                Comment = "Тестовий відгук"
            };

            // 2. Act
            var result = await controller.PostProposal(newProposal);

            // 3. Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedProposal = Assert.IsType<Proposal>(actionResult.Value);
            Assert.Equal(100, returnedProposal.Price);
            Assert.Equal(1, await context.Proposals.CountAsync());
        }

        [Fact]
        public async Task UpdateStatus_Accepted_RejectsOtherPendingProposals()
        {
            // 1. Arrange
            var context = GetDatabaseContext();

            var listing = new Listing { Id = 1, UserId = 1, StartMMR = 1000, TargetMMR = 1500, Price = 500, Status = ListingStatus.Open };
            context.Listings.Add(listing);

            var proposal1 = new Proposal { Id = 1, ListingId = 1, UserId = 2, Price = 100, Status = ProposalStatus.Pending };
            var proposal2 = new Proposal { Id = 2, ListingId = 1, UserId = 3, Price = 150, Status = ProposalStatus.Pending };

            context.Proposals.AddRange(proposal1, proposal2);
            await context.SaveChangesAsync();

            var controller = new ProposalsController(context);

            // 2. Act
            var result = await controller.UpdateStatus(1, ProposalStatus.Accepted);

            // 3. Assert
            Assert.IsType<NoContentResult>(result);

            var dbProposal1 = await context.Proposals.FindAsync(1);
            var dbProposal2 = await context.Proposals.FindAsync(2);

            Assert.Equal(ProposalStatus.Accepted, dbProposal1.Status);
            Assert.Equal(ProposalStatus.Rejected, dbProposal2.Status);
        }

        [Fact]
        public async Task DeleteProposal_ExistingId_RemovesFromDb()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var proposal = new Proposal { Id = 1, ListingId = 1, UserId = 2, Price = 100, Status = ProposalStatus.Pending };
            context.Proposals.Add(proposal);
            await context.SaveChangesAsync();

            var controller = new ProposalsController(context);

            // 2. Act
            var result = await controller.DeleteProposal(1);

            // 3. Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.Proposals.CountAsync());
        }
    }
}