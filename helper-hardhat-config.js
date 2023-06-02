const { ethers } = require("hardhat");

const networkConfig = {
    31337: {
        name: "localhost",
        mintFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callBackGasLimit: "500000",
        interval: "60",
    },
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2Address: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        mintFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        subscriptionId: "2196",
        callBackGasLimit: "500000",
        interval: "60",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    }
}
const devChains = ["hardhat", "localhost"];
module.exports = { networkConfig, devChains };