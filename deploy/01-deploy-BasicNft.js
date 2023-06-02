const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const { devChains } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    log("---------------------------------");
    const args = [];
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log("---------------------------------");
    if (!devChains.includes(network.name)) {
        await verify(basicNft.address, args);
    }

}
module.exports.tags = ["all", "basicnft", "main"];