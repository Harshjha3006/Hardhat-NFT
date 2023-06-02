const { ethers, network } = require("hardhat");
const { devChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");
require("dotenv").config();

const FUND_AMOUNT = ethers.utils.parseEther("1");
const imagesLocation = "./images/RandomIpfsNft/";
const metaDataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}
let tokenUris = [
    'https://ipfs.io/ipfs/QmRxVeWvsqDZUpkp8faQFYaSt9ojkVoUawQsXLKwbgjMjY',
    'https://ipfs.io/ipfs/QmXeMmsf14cdWhksuyrT4CEQRziPAkd4NaRib3YpV9twqN',
    'https://ipfs.io/ipfs/QmVbzV9H7yDzQJNGKUA3UGbNJWuaR6rxirBeXgSShQ78bp'
]
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address;
    let subId;
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }
    if (devChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
        const tx = await VRFCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);
        subId = txReceipt.events[0].args.subId;
        await VRFCoordinatorV2Mock.fundSubscription(subId, FUND_AMOUNT);
    }
    else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2Address"];
        subId = networkConfig[chainId]["subscriptionId"];
    }
    const gasLane = networkConfig[chainId]["gasLane"];
    const mintFee = networkConfig[chainId]["mintFee"];
    const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"];
    const args = [vrfCoordinatorV2Address, subId, gasLane, mintFee, callBackGasLimit, tokenUris];
    log("Deploying ....");
    const RandomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.blockConfirmations || 1
    });
    log("Deployed ...");
    if (devChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        await VRFCoordinatorV2Mock.addConsumer(subId, RandomIpfsNft.address);
    }
    if (!devChains.includes(network.name)) {
        log("Verifying ...");
        await verify(RandomIpfsNft.address, args);
    }
}
async function handleTokenUris() {
    tokenUris = [];
    const { responses: ImageUploadResponses, files } = await storeImages(imagesLocation);
    for (let ImageUploadResponseIndex in ImageUploadResponses) {
        const tokenUriMetadata = { ...metaDataTemplate };
        tokenUriMetadata.name = files[ImageUploadResponseIndex].replace(".png", "");
        tokenUriMetadata.description = `An Adorable ${tokenUriMetadata.name} pup`;
        tokenUriMetadata.image = `https://ipfs.io/ipfs/${ImageUploadResponses[ImageUploadResponseIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name} to Ipfs`);
        const response = await storeTokenUriMetadata(tokenUriMetadata);
        tokenUris.push(`https://ipfs.io/ipfs/${response.IpfsHash}`);
    }
    console.log(`Token Uris are uploaded !`);
    console.log(tokenUris);
    return tokenUris;
}
module.exports.tags = ["all", "randomipfs", "main"];