using ISTTP_lab_2.Controllers;
using ISTTP_lab_2.Models;
using ISTTP_lab_2.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ISTTP_lab_2.Tests
{
    public class ContractsControllerTests
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
        public async Task PostContract_ValidObject_ReturnsCreatedAtActionAndAddsToDb()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var controller = new ContractsController(context);

            var newContract = new Contract
            {
                ClientId = 1,
                BoosterId = 2,
                Price = 500,
                StartMMR = 1500,
                TargetMMR = 2000,
                Status = ContractStatus.Active
            };

            // 2. Act
            var result = await controller.PostContract(newContract);

            // 3. Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedContract = Assert.IsType<Contract>(actionResult.Value);
            Assert.Equal(500, returnedContract.Price);
            Assert.Equal(1, await context.Contracts.CountAsync());
        }

        [Fact]
        public async Task UpdateStatus_Completed_SetsCompletedAtDate()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var contract = new Contract
            {
                Id = 1,
                ClientId = 1,
                BoosterId = 2,
                Price = 500,
                StartMMR = 1500,
                TargetMMR = 2000,
                Status = ContractStatus.Active
            };

            context.Contracts.Add(contract);
            await context.SaveChangesAsync();

            var controller = new ContractsController(context);

            // 2. Act
            var result = await controller.UpdateStatus(1, ContractStatus.Completed);

            // 3. Assert
            Assert.IsType<NoContentResult>(result);

            var dbContract = await context.Contracts.FindAsync(1);
            Assert.Equal(ContractStatus.Completed, dbContract.Status);
            Assert.NotNull(dbContract.CompletedAt); 
        }

        [Fact]
        public async Task GetContract_InvalidId_ReturnsNotFound()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var controller = new ContractsController(context);

            // 2. Act
            var result = await controller.GetContract(999);

            // 3. Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }
    }
}