const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagesPath);
    const responses = [];
    console.log("Uploading to IPFS ...");
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
        const options = {
            pinataMetadata: {
                name: files[fileIndex]
            }
        }
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile, options);
            responses.push(response);
        }
        catch (e) {
            console.log(e);
        }
    }
    console.log("Images Uploaded");
    return { responses, files };
}
async function storeTokenUriMetadata(metadata) {
    const options = {
        pinataMetadata: {
            name: metadata.name
        }
    }
    try {
        const response = await pinata.pinJSONToIPFS(metadata, options);
        return response;
    }
    catch (e) {
        console.log(e);
    }
    return null;
}
module.exports = { storeImages, storeTokenUriMetadata };