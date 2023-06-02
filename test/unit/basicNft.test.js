const { assert } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { devChains } = require("../../helper-hardhat-config");

!devChains.includes(network.name) ?
    describe.skip :
    describe("BasicNft", function () {
        let deployer, basicNft;
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            basicNft = await ethers.getContract("BasicNft", deployer);
        })
        describe("constructor", function () {
            it("constructor variables are correctly initialised", async function () {
                const name = await basicNft.name();
                const symbol = await basicNft.symbol();
                const tokenCounter = await basicNft.getTokenCounter();
                assert.equal(tokenCounter.toString(), "0");
                assert.equal(name.toString(), "Dogie");
                assert.equal(symbol.toString(), "DOG");
            })
        })
        describe("mintNft", function () {
            beforeEach(async function () {
                const tx = await basicNft.mintNft();
                await tx.wait(1);
            })
            it("tokenCounter should be updated", async function () {
                const tokenCounter = await basicNft.getTokenCounter();
                assert.equal(tokenCounter.toString(), "1");
            })
            it("balances and owner should be updated", async function () {
                const deployerAddress = deployer;
                const deployerBalance = await basicNft.balanceOf(deployer);
                const owner = await basicNft.ownerOf("0");
                assert.equal(deployerBalance.toString(), "1");
                assert.equal(owner, deployerAddress);
            })
        })
    })