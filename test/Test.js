const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Demo", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployDemoFixture() {
    const gwei = 1000000000;
    const favNumber = 4;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Demo = await ethers.getContractFactory("Demo");
    const demo = await Demo.deploy(favNumber, { value: gwei });

    return { demo, favNumber, gwei, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { demo, owner } = await loadFixture(deployDemoFixture);

      expect(await demo.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to lock", async function () {
      const { demo, gwei } = await loadFixture(deployDemoFixture);

      expect(await ethers.provider.getBalance(demo.address)).to.equal(gwei);
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      const latestTime = await time.latest();
      const Demo = await ethers.getContractFactory("Demo");
      await expect(Demo.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Value should be greater than 5"
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { demo, otherAccount } = await loadFixture(deployDemoFixture);

        // We use lock.connect() to send a transaction from another account
        await expect(demo.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { demo, gwei } = await loadFixture(deployDemoFixture);

        await expect(demo.withdraw())
          .to.emit(demo, "Withdrawal")
          .withArgs(gwei, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { demo, gwei, owner } = await loadFixture(deployDemoFixture);

        await expect(demo.withdraw()).to.changeEtherBalances(
          [demo, owner],
          [-gwei, gwei]
        );
      });
    });
  });
});
