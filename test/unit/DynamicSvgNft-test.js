const { assert, expect } = require("chai");
const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat.config");
const fs = require("fs");

const highTokenUri =
    "data:application/json;base64,eyJuYW1lIjpEeW5hbWljIFNWRyBORlQiLCAiZGVzY3JpcHRpb24iOiJBbiBORlQgdGhhdCBjaGFuZ2VzIGJhc2VkIG9uIHRoZSBDaGFpbmxpbmsgRmVlZCIsImF0dHJpYnV0ZXMiOiBbeyJ0cmFpdF90eXBlIjogImNvb2xuZXNzIiwgInZhbHVlIjogMTAwfV0sICJpbWFnZSI6ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjJhV1YzUW05NFBTSXdJREFnTWpBd0lESXdNQ0lnZDJsa2RHZzlJalF3TUNJZ0lHaGxhV2RvZEQwaU5EQXdJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lQZ29nSUR4amFYSmpiR1VnWTNnOUlqRXdNQ0lnWTNrOUlqRXdNQ0lnWm1sc2JEMGllV1ZzYkc5M0lpQnlQU0kzT0NJZ2MzUnliMnRsUFNKaWJHRmpheUlnYzNSeWIydGxMWGRwWkhSb1BTSXpJaTgrQ2lBZ1BHY2dZMnhoYzNNOUltVjVaWE1pUGdvZ0lDQWdQR05wY21Oc1pTQmplRDBpTmpFaUlHTjVQU0k0TWlJZ2NqMGlNVElpTHo0S0lDQWdJRHhqYVhKamJHVWdZM2c5SWpFeU55SWdZM2s5SWpneUlpQnlQU0l4TWlJdlBnb2dJRHd2Wno0S0lDQThjR0YwYUNCa1BTSnRNVE0yTGpneElERXhOaTQxTTJNdU5qa2dNall1TVRjdE5qUXVNVEVnTkRJdE9ERXVOVEl0TGpjeklpQnpkSGxzWlQwaVptbHNiRHB1YjI1bE95QnpkSEp2YTJVNklHSnNZV05yT3lCemRISnZhMlV0ZDJsa2RHZzZJRE03SWk4K0Nqd3ZjM1puUGc9PSJ9";
const lowTokenUri =
    "data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiQW4gTkZUIHRoYXQgY2hhbmdlcyBiYXNlZCBvbiB0aGUgQ2hhaW5saW5rIEZlZWQiLCAiYXR0cmlidXRlcyI6IFt7InRyYWl0X3R5cGUiOiAiY29vbG5lc3MiLCAidmFsdWUiOiAxMDB9XSwgImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQRDk0Yld3Z2RtVnljMmx2YmowaU1TNHdJaUJ6ZEdGdVpHRnNiMjVsUFNKdWJ5SS9QZ284YzNabklIZHBaSFJvUFNJeE1ESTBjSGdpSUdobGFXZG9kRDBpTVRBeU5IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UQXlOQ0F4TURJMElpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnb2dJRHh3WVhSb0lHWnBiR3c5SWlNek16TWlJR1E5SWswMU1USWdOalJETWpZMExqWWdOalFnTmpRZ01qWTBMallnTmpRZ05URXljekl3TUM0MklEUTBPQ0EwTkRnZ05EUTRJRFEwT0MweU1EQXVOaUEwTkRndE5EUTRVemMxT1M0MElEWTBJRFV4TWlBMk5IcHRNQ0E0TWpCakxUSXdOUzQwSURBdE16Y3lMVEUyTmk0MkxUTTNNaTB6TnpKek1UWTJMall0TXpjeUlETTNNaTB6TnpJZ016Y3lJREUyTmk0MklETTNNaUF6TnpJdE1UWTJMallnTXpjeUxUTTNNaUF6TnpKNklpOCtDaUFnUEhCaGRHZ2dabWxzYkQwaUkwVTJSVFpGTmlJZ1pEMGlUVFV4TWlBeE5EQmpMVEl3TlM0MElEQXRNemN5SURFMk5pNDJMVE0zTWlBek56SnpNVFkyTGpZZ016Y3lJRE0zTWlBek56SWdNemN5TFRFMk5pNDJJRE0zTWkwek56SXRNVFkyTGpZdE16Y3lMVE0zTWkwek56SjZUVEk0T0NBME1qRmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdPVFlnTUNBME9DNHdNU0EwT0M0d01TQXdJREFnTVMwNU5pQXdlbTB6TnpZZ01qY3lhQzAwT0M0eFl5MDBMaklnTUMwM0xqZ3RNeTR5TFRndU1TMDNMalJETmpBMElEWXpOaTR4SURVMk1pNDFJRFU1TnlBMU1USWdOVGszY3kwNU1pNHhJRE01TGpFdE9UVXVPQ0E0T0M0Mll5MHVNeUEwTGpJdE15NDVJRGN1TkMwNExqRWdOeTQwU0RNMk1HRTRJRGdnTUNBd0lERXRPQzA0TGpSak5DNDBMVGcwTGpNZ056UXVOUzB4TlRFdU5pQXhOakF0TVRVeExqWnpNVFUxTGpZZ05qY3VNeUF4TmpBZ01UVXhMalpoT0NBNElEQWdNQ0F4TFRnZ09DNDBlbTB5TkMweU1qUmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdNQzA1TmlBME9DNHdNU0EwT0M0d01TQXdJREFnTVNBd0lEazJlaUl2UGdvZ0lEeHdZWFJvSUdacGJHdzlJaU16TXpNaUlHUTlJazB5T0RnZ05ESXhZVFE0SURRNElEQWdNU0F3SURrMklEQWdORGdnTkRnZ01DQXhJREF0T1RZZ01IcHRNakkwSURFeE1tTXRPRFV1TlNBd0xURTFOUzQySURZM0xqTXRNVFl3SURFMU1TNDJZVGdnT0NBd0lEQWdNQ0E0SURndU5HZzBPQzR4WXpRdU1pQXdJRGN1T0MwekxqSWdPQzR4TFRjdU5DQXpMamN0TkRrdU5TQTBOUzR6TFRnNExqWWdPVFV1T0MwNE9DNDJjemt5SURNNUxqRWdPVFV1T0NBNE9DNDJZeTR6SURRdU1pQXpMamtnTnk0MElEZ3VNU0EzTGpSSU5qWTBZVGdnT0NBd0lEQWdNQ0E0TFRndU5FTTJOamN1TmlBMk1EQXVNeUExT1RjdU5TQTFNek1nTlRFeUlEVXpNM3B0TVRJNExURXhNbUUwT0NBME9DQXdJREVnTUNBNU5pQXdJRFE0SURRNElEQWdNU0F3TFRrMklEQjZJaTgrQ2p3dmMzWm5QZ289In0=";

describe("DynamicSvgNft", function () {
    let deployer, dynamicSvgNft, ethUsdPriceFeed;
    let highSvgUri, lowSvgUri;

    const chainId = network.config.chainId;
    beforeEach(async function () {
        await deployments.fixture(["mocks", "dynamicsvg"]);
        deployer = (await getNamedAccounts).deployer;
        dynamicSvgNft = await ethers.getContract("DynamicSvgNft");
        ethUsdPriceFeed = await ethers.getContract("MockV3Aggregator");

        const expectedLowSVG = await fs.readFileSync("./images/dynamic/frown.svg", {
            encoding: "utf8",
        });
        let expectedLowSVGUri = btoa(expectedLowSVG);
        expectedLowSVGUri = "data:image/svg+xml;base64," + expectedLowSVGUri;
        lowSvgUri = expectedLowSVGUri;

        const expectedHighSVG = await fs.readFileSync("./images/dynamic/happy.svg", {
            encoding: "utf8",
        });

        let expectedHighSVGUri = btoa(expectedHighSVG);
        expectedHighSVGUri = "data:image/svg+xml;base64," + expectedHighSVGUri;
        highSvgUri = expectedHighSVGUri;
    });

    describe("Dynamic Svg Constructor", function () {
        it("Check if price feed and tokencounter is initialized", async function () {
            const ethUsdPriceFeedAddress = await ethUsdPriceFeed.address;

            const priceFeed = await dynamicSvgNft.getPriceFeed();
            assert.equal(priceFeed, ethUsdPriceFeedAddress.toString());

            const tokenCounter = await dynamicSvgNft.getTokenCounter();
            assert.equal(tokenCounter.toString(), "0");
        });
        it("checking if low svg initialized", async function () {
            const lowSvg = await dynamicSvgNft.getLowSVG();

            assert.equal(lowSvg.toString(), lowSvgUri.toString());
        });
        it("checking if high svg initialized", async function () {
            const highSvg = await dynamicSvgNft.getHighSVG();

            assert.equal(highSvg.toString(), highSvgUri.toString());
        });
    });

    describe("mint nft", function () {
        it("function emits CreatedNFT", async function () {
            const highValue = await ethers.utils.parseEther("1");
            await expect(dynamicSvgNft.mintNft(highValue)).to.emit(dynamicSvgNft, "CreatedNFT");

            const tokenCounter = await dynamicSvgNft.getTokenCounter();
            assert.equal(tokenCounter.toString(), "1");

            const tokenUri = await dynamicSvgNft.tokenURI(1);
            assert.equal(tokenUri, highTokenUri);
        });
        it("shifts the token uri to lower when the price doesn't surpass the highvalue", async function () {
            const highValue = await ethers.utils.parseEther("100");
            const txResponse = await dynamicSvgNft.mintNft(highValue);
            await txResponse.wait(1);

            const lowValue = await ethers.utils.parseEther("1");
            const secondTxResponse = await dynamicSvgNft.mintNft(lowValue);
            await secondTxResponse.wait(1);

            const tokenUriHigh = await dynamicSvgNft.tokenURI(1);
            const tokenUriLow = await dynamicSvgNft.tokenURI(2);

            assert(tokenUriHigh, highTokenUri);
            assert(tokenUriLow, lowTokenUri);
        });
    });

    describe("svg to image uri", function () {
        it("checking if svg converted to uri", async function () {
            const highSVG = await fs.readFileSync("./images/dynamic/happy.svg", {
                encoding: "utf8",
            });
            const highSvgUriFromFunction = await dynamicSvgNft.svgToImageURI(highSVG);

            assert.equal(highSvgUriFromFunction.toString(), highSvgUri.toString());
        });
    });
});
