const { network, ethers } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;

    // Basic Nft
    const basicNft = await ethers.getContract("BasicNft", deployer);
    const basicNftTx = await basicNft.mintNft();
    await basicNftTx.wait(1);
    console.log(`Basic Nft index 0 token Uri : ${await basicNft.tokenURI(0)}`);

    // Dynamic SVG NFT

    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
    const highValue = ethers.utils.parseEther("4000");
    const dynamicSvgNftTx = await dynamicSvgNft.mintNft(highValue);
    await dynamicSvgNftTx.wait(1);
    console.log(`Dynamic SVG Nft index 0 token uri : ${await dynamicSvgNft.tokenURI(0)}`);

    // Random Ipfs Nft
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomIpfsNft.getMintFee();
    const randomIpfsNftTx = await randomIpfsNft.requestNft({ value: mintFee });
    const randomIpfsNftMintTxReceipt = await randomIpfsNftTx.wait(1);

    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
            resolve()
        })
        if (chainId == 31337) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
}
module.exports.tags = ["all", "mint"]
