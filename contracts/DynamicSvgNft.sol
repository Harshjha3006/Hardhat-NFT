//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
error ERC721Metadata__URI_QueryFor_NonExistentToken();
contract DynamicSvgNft is ERC721{

    uint256 private s_tokenCounter;
    string private  i_lowSvg;
    string private i_highSvg;
    AggregatorV3Interface private immutable i_priceFeed;
    mapping(uint256 => int)tokenidToHighValue;

    event NftCreated(uint256 indexed tokenId,int highValue);

    constructor(string memory lowSvg,string memory highSvg,address priceFeedAddress) ERC721("Dynamic SVG NFT","DSN"){
        s_tokenCounter = 0;
        i_lowSvg = svgToTokenUri(lowSvg);
        i_highSvg = svgToTokenUri(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }
    function mintNft(int highValue) public{
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter++;
        _safeMint(msg.sender,newTokenId);
        tokenidToHighValue[newTokenId] = highValue;
        emit NftCreated(newTokenId,highValue);
    }
    function svgToTokenUri(string memory svg)public pure returns(string memory){
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory base64SvgEncoded = Base64.encode(abi.encodePacked(svg));
        return string(abi.encodePacked(baseURL,base64SvgEncoded));

    }
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }
    function tokenURI(uint256 tokenId) public view virtual override returns(string memory){
        if(!_exists(tokenId)){
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }
        (,int price,,,) = i_priceFeed.latestRoundData();
        string memory tokenImageUri = i_lowSvg;
        if(price >= tokenidToHighValue[tokenId]){
            tokenImageUri = i_highSvg;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                tokenImageUri,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
    function getLowSvg() public view returns(string memory){
        return i_lowSvg;
    }
    function getHighSvg() public view returns(string memory){
        return i_highSvg;
    }
    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter;
    }
}