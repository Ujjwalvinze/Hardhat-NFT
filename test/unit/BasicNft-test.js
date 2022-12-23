const { assert, expect } = require("chai");
const { ethers, deployments, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat.config");

describe("Basic NFT", function () {
    let BasicNft;
    let deployer;
    let tokenCountAfterMint;

    beforeEach(async function () {
        await deployments.fixture("all");

        deployer = (await getNamedAccounts()).deployer;
        BasicNft = await ethers.getContract("BasicNft", deployer);
    });
    it("Checking Constructor", async function () {
        const tokenCount = await BasicNft.getTokenCounter();
        const name = await BasicNft.name();
        const symbol = await BasicNft.symbol();

        assert.equal(tokenCount.toString(), "0");
        assert.equal(name, "Dogie");
        assert.equal(symbol, "DOG");
    });

    describe("Testing Functions : ", function () {
        beforeEach(async function () {
            await BasicNft.mintNft();
        });

        it("Checking the token URI", async function () {
            const expectedTokenURI = await BasicNft.TOKEN_URI();
            const tokenURI = await BasicNft.tokenURI(0);

            assert.equal(tokenURI.toString(), expectedTokenURI.toString());
        });

        it("Checking the getCounter", async function () {
            const tokenCount = await BasicNft.getTokenCounter();

            assert.equal(tokenCount.toString(), "1");
        });
    });
});
