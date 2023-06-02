const { network, ethers } = require("hardhat");
const { devChains, networkConfig } = require("../helper-hardhat-config");
const fs = require("fs");
const { verify } = require("../utils/verify.js")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let priceFeedAddress;
    if (devChains.includes(network.name)) {
        const mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
        priceFeedAddress = mockV3Aggregator.address;
    }
    else {
        priceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    const lowSvg = fs.readFileSync("./images/DynamicSvgNft/frown.svg", "utf-8");
    const highSvg = fs.readFileSync("./images/DynamicSvgNft/happy.svg", "utf-8");
    const args = [lowSvg, highSvg, priceFeedAddress];
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!devChains.includes(network.name)) {
        log("Verifying ...");
        await verify(dynamicSvgNft.address, args);
    }
}
module.exports.tags = ["all", "dynamicSvgNft", "main"];