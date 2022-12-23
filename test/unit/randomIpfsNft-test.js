const { assert, expect } = require("chai");
const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat.config");

describe("randomIpfsNft", function () {
    let randomIpfsNft;
    let vrfCoordinatorV2Mock;
    let deployer;
    const chainId = network.config.chainId;

    beforeEach(async function () {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "randomipfs"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft");
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    });

    describe("Random Constructor", function () {
        it("Checking all constructor", async function () {
            // address vrfCoordinatorV2,
            // uint64 subscriptionId,
            // bytes32 gasLane, // keyHash
            // uint256 mintFee,
            // uint32 callbackGasLimit,
            // string[3] memory dogTokenUris

            const mintFee = await randomIpfsNft.getMintFee();
            const tokenCounter = await randomIpfsNft.getTokenCounter();
            const expectedTokenURI = await randomIpfsNft.getDogTokenUris(1);
            const expectedMintFee = networkConfig[chainId].mintFee;

            assert.equal(mintFee.toString(), expectedMintFee.toString());
            // console.log(expectedTokenURI);
            assert.equal(tokenCounter.toString(), "0");
        });
    });

    describe("request nft", function () {
        it("failing if payment not sent with any request", async function () {
            await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                "RandomIpfsNft__NeedMoreETHSent"
            );
        });
        it("failing if not enough value sent", async function () {
            // const fee = await ethers.utils.parseEther("0.001");
            const fee = await randomIpfsNft.getMintFee();
            await expect(
                randomIpfsNft.requestNft({ value: fee.sub(ethers.utils.parseEther("0.001")) })
            ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
        });
        it("emits event if nft requested", async function () {
            const fee = await randomIpfsNft.getMintFee();
            // const feeToPass = 2 * fee;
            // console.log(`Fee is : ${fee}`);
            // console.log(fee.toString() % 1e18); // fee is correct
            await expect(randomIpfsNft.requestNft({ value: fee.toString() })).to.emit(
                randomIpfsNft,
                "NftRequested"
            );
        });
    });

    describe("fulfill random words", function () {
        it("Nft minted after random number generated", async function () {
            await new Promise(async (resolve, reject) => {
                randomIpfsNft.once("NftMinted", async function () {
                    try {
                        const tokenUri = await randomIpfsNft.getDogTokenUris(0);
                        const tokenCounter = await randomIpfsNft.getTokenCounter();

                        assert.equal(tokenUri.toString().includes("ipfs://"), true);
                        assert.equal(tokenCounter.toString(), "1");
                        resolve();
                    } catch (e) {
                        console.log(e);
                        reject(e);
                    }
                });

                try {
                    const fee = await randomIpfsNft.getMintFee();
                    const tx = await randomIpfsNft.requestNft({ value: fee.toString() });
                    const txReceipt = await tx.wait(1);

                    const requestId = txReceipt.events[1].args.requestId;

                    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address);
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        });
    });
    describe("Get breed from modded rng", function () {
        it("checking if dog breed returned is correct", async function () {
            // const expectedValue = await randomIpfsNft.getBreedFromModdedRng(3);
            assert.equal((await randomIpfsNft.getBreedFromModdedRng(3)).toString(), "0");
            assert.equal((await randomIpfsNft.getBreedFromModdedRng(30)).toString(), "1");
            assert.equal((await randomIpfsNft.getBreedFromModdedRng(70)).toString(), "2");
        });

        it("should revert if rng > 99", async function () {
            await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWith(
                "RandomIpfsNft__RangeOutOfBounds"
            );
        });
    });
});
