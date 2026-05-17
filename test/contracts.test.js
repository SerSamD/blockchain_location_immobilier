const RealEstateRegistry = artifacts.require("RealEstateRegistry");
const RentalAgreement = artifacts.require("RentalAgreement");

contract("RealEstateRegistry", (accounts) => {
  let registry;
  const owner = accounts[0];
  const tenant = accounts[1];
  const landlord = accounts[2];

  beforeEach(async () => {
    registry = await RealEstateRegistry.new();
  });

  describe("Listing Properties", () => {
    it("should list a new property", async () => {
      const tx = await registry.listProperty(
        "Paris, 5ème",
        "Beautiful apartment",
        web3.utils.toWei("1.5", "ether"),
        "apartment",
        2,
        1,
        ["ipfs://QmHash1"]
      );

      const property = await registry.getProperty(0);
      assert.equal(property.location, "Paris, 5ème");
      assert.equal(property.pricePerMonth, web3.utils.toWei("1.5", "ether"));
      assert.equal(property.bedrooms, 2);
    });

    it("should fail to list with zero price", async () => {
      try {
        await registry.listProperty(
          "Paris",
          "Apartment",
          0,
          "apartment",
          2,
          1,
          []
        );
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Price must be greater than 0"));
      }
    });

    it("should get available properties", async () => {
      // List 3 properties
      for (let i = 0; i < 3; i++) {
        await registry.listProperty(
          `Location ${i}`,
          "Description",
          web3.utils.toWei("1", "ether"),
          "apartment",
          2,
          1,
          []
        );
      }

      const available = await registry.getAvailableProperties();
      assert.equal(available.length, 3);
    });

    it("should get properties by owner", async () => {
      // Owner 1 lists 2 properties
      await registry.listProperty(
        "Paris",
        "Apt 1",
        web3.utils.toWei("1", "ether"),
        "apartment",
        2,
        1,
        []
      );
      
      await registry.listProperty(
        "Lyon",
        "Apt 2",
        web3.utils.toWei("2", "ether"),
        "apartment",
        3,
        2,
        []
      );

      // Owner 2 lists 1 property
      const properties = await registry.getPropertiesByOwner(owner);
      assert.equal(properties.length, 2);
    });
  });

  describe("Updating Properties", () => {
    beforeEach(async () => {
      await registry.listProperty(
        "Paris",
        "Original description",
        web3.utils.toWei("1", "ether"),
        "apartment",
        2,
        1,
        []
      );
    });

    it("should update property details", async () => {
      await registry.updateProperty(
        0,
        "Updated description",
        web3.utils.toWei("1.5", "ether"),
        true
      );

      const property = await registry.getProperty(0);
      assert.equal(property.description, "Updated description");
      assert.equal(
        property.pricePerMonth,
        web3.utils.toWei("1.5", "ether")
      );
    });

    it("should fail to update if not owner", async () => {
      try {
        await registry.updateProperty(
          0,
          "New description",
          web3.utils.toWei("1", "ether"),
          true,
          { from: tenant }
        );
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Only property owner"));
      }
    });

    it("should delist a property", async () => {
      await registry.delistProperty(0);
      const property = await registry.getProperty(0);
      assert.equal(property.available, false);
    });
  });

  describe("Reviews", () => {
    beforeEach(async () => {
      await registry.listProperty(
        "Paris",
        "Apartment",
        web3.utils.toWei("1", "ether"),
        "apartment",
        2,
        1,
        []
      );
    });

    it("should add a review", async () => {
      await registry.addReview(0, 5, "Excellent property!", { from: tenant });
      const reviews = await registry.getReviews(0);
      assert.equal(reviews.length, 1);
      assert.equal(reviews[0].rating, 5);
    });

    it("should calculate average rating", async () => {
      await registry.addReview(0, 5, "Great!", { from: accounts[3] });
      await registry.addReview(0, 3, "Good", { from: accounts[4] });
      
      const avgRating = await registry.getAverageRating(0);
      assert.equal(avgRating, 4); // (5 + 3) / 2 = 4
    });
  });
});

contract("RentalAgreement", (accounts) => {
  let registry;
  let rental;
  const landlord = accounts[0];
  const tenant = accounts[1];

  beforeEach(async () => {
    registry = await RealEstateRegistry.new();
    rental = await RentalAgreement.new(registry.address);

    // List a property
    await registry.listProperty(
      "Paris",
      "Nice apartment",
      web3.utils.toWei("1", "ether"),
      "apartment",
      2,
      1,
      []
    );
  });

  describe("Creating Rentals", () => {
    it("should create a rental agreement", async () => {
      const latest = await web3.eth.getBlock('latest');
      const now = latest ? latest.timestamp : Math.floor(Date.now() / 1000);
      const startDate = now + 86400; // Tomorrow
      const endDate = now + 86400 * 30; // 30 days later

      await rental.createRental(
        0,
        landlord,
        startDate,
        endDate,
        web3.utils.toWei("1", "ether"),
        web3.utils.toWei("2", "ether"),
        { from: tenant }
      );

      const rentalData = await rental.getRental(0);
      assert.equal(rentalData.tenant, tenant);
      assert.equal(rentalData.landlord, landlord);
      assert.equal(rentalData.status, 0); // PENDING
    });

    it("should fail with invalid dates", async () => {
      const latest = await web3.eth.getBlock('latest');
      const now = latest ? latest.timestamp : Math.floor(Date.now() / 1000);
      
      try {
        await rental.createRental(
          0,
          landlord,
          now + 100, // End date
          now + 50, // Start date (earlier than end)
          web3.utils.toWei("1", "ether"),
          web3.utils.toWei("2", "ether"),
          { from: tenant }
        );
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Start date must be before end date"));
      }
    });
  });

  describe("Rental Activation", () => {
    let startDate, endDate;

    beforeEach(async () => {
      const latest = await web3.eth.getBlock('latest');
      const now = latest ? latest.timestamp : Math.floor(Date.now() / 1000);
      startDate = now + 86400;
      endDate = now + 86400 * 30;

      await rental.createRental(
        0,
        landlord,
        startDate,
        endDate,
        web3.utils.toWei("1", "ether"),
        web3.utils.toWei("2", "ether"),
        { from: tenant }
      );
    });

    it("should activate rental by landlord", async () => {
      await rental.activateRental(0, { from: landlord });
      const rentalData = await rental.getRental(0);
      assert.equal(rentalData.status, 1); // ACTIVE
    });

    it("should fail if not landlord", async () => {
      try {
        await rental.activateRental(0, { from: tenant });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Only landlord"));
      }
    });
  });

  describe("Payments", () => {
    let startDate, endDate;

    beforeEach(async () => {
      const latest = await web3.eth.getBlock('latest');
      const now = latest ? latest.timestamp : Math.floor(Date.now() / 1000);
      startDate = now + 100; // Near future
      endDate = now + 86400 * 30;

      await rental.createRental(
        0,
        landlord,
        startDate,
        endDate,
        web3.utils.toWei("1", "ether"),
        web3.utils.toWei("2", "ether"),
        { from: tenant }
      );

      // Activate rental
      await rental.activateRental(0, { from: landlord });
      // Fast-forward EVM time so rental has started for payment tests
      await new Promise((resolve, reject) => {
        web3.currentProvider.send(
          { jsonrpc: '2.0', method: 'evm_increaseTime', params: [200], id: Date.now() },
          (err) => (err ? reject(err) : resolve())
        );
      });
      await new Promise((resolve, reject) => {
        web3.currentProvider.send(
          { jsonrpc: '2.0', method: 'evm_mine', params: [], id: Date.now() + 1 },
          (err) => (err ? reject(err) : resolve())
        );
      });
    });

    it("should pay rent", async () => {
      // Wait for rental to start
      // In real tests, you'd use evm_increaseTime
      
      // For now, just test payment validation
      const initialBalance = await web3.eth.getBalance(rental.address);
      
      await rental.payRent(0, {
        from: tenant,
        value: web3.utils.toWei("1", "ether")
      });

      const payments = await rental.getRentalPayments(0);
      assert.equal(payments.length, 1);
      assert.equal(
        payments[0].amount,
        web3.utils.toWei("1", "ether")
      );
    });

    it("should confirm payment as landlord", async () => {
      await rental.payRent(0, {
        from: tenant,
        value: web3.utils.toWei("1", "ether")
      });

      const landlordBalanceBefore = await web3.eth.getBalance(landlord);
      
      await rental.confirmPayment(0, 0, { from: landlord });
      
      const payments = await rental.getRentalPayments(0);
      assert.equal(payments[0].confirmed, true);
    });
  });

  describe("Rental Queries", () => {
    beforeEach(async () => {
      const latest = await web3.eth.getBlock('latest');
      const now = latest ? latest.timestamp : Math.floor(Date.now() / 1000);
      
      await rental.createRental(
        0,
        landlord,
        now + 86400,
        now + 86400 * 30,
        web3.utils.toWei("1", "ether"),
        web3.utils.toWei("2", "ether"),
        { from: tenant }
      );
    });

    it("should get tenant rentals", async () => {
      const rentals = await rental.getTenantRentals(tenant);
      assert.equal(rentals.length, 1);
    });

    it("should get landlord rentals", async () => {
      const rentals = await rental.getLandlordRentals(landlord);
      assert.equal(rentals.length, 1);
    });
  });
});
