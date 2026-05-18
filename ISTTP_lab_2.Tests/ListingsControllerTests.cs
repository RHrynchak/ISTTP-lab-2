using ISTTP_lab_2.Controllers;
using ISTTP_lab_2.Models;
using ISTTP_lab_2.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ISTTP_lab_2.Tests
{
    public class ListingsControllerTests
    {
        // Допоміжний метод для створення чистої бази даних у пам'яті для КОЖНОГО тесту
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
        public async Task PostListing_ValidObject_ReturnsCreatedAtActionAndAddsToDb()
        {
            // 1. Arrange (Підготовка)
            var context = GetDatabaseContext();
            var controller = new ListingsController(context); 

            var newListing = new Listing
            {
                UserId = 1,
                StartMMR = 1500,
                TargetMMR = 2000,
                Price = 500,
                Status = ListingStatus.Open,
                Comment = "Тестове замовлення"
            };

            // 2. Act (Дія)
            var result = await controller.PostListing(newListing); 

            // 3. Assert (Перевірка результату)
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedListing = Assert.IsType<Listing>(actionResult.Value);
            Assert.Equal(500, returnedListing.Price);
            Assert.Equal(1, await context.Listings.CountAsync());
        }

        [Fact]
        public async Task UpdateStatus_ExistingListing_ChangesStatusToClosed()
        {
            // 1. Arrange
            var context = GetDatabaseContext();

            var listing = new Listing { Id = 1, UserId = 1, StartMMR = 1000, TargetMMR = 1500, Price = 100, Status = ListingStatus.Open };
            context.Listings.Add(listing);
            await context.SaveChangesAsync();

            var controller = new ListingsController(context); 

            // 2. Act
            var result = await controller.UpdateStatus(1, ListingStatus.Closed); 

            // 3. Assert
            Assert.IsType<NoContentResult>(result);

            var dbListing = await context.Listings.FindAsync(1);
            Assert.Equal(ListingStatus.Closed, dbListing.Status);
        }

        [Fact]
        public async Task GetListing_InvalidId_ReturnsNotFound()
        {
            // 1. Arrange
            var context = GetDatabaseContext(); 
            var controller = new ListingsController(context);

            // 2. Act
            var result = await controller.GetListing(999); 

            // 3. Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }
    }
}