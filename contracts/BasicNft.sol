//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721{
    uint256 private s_TokenCounter; 
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    constructor() ERC721("Dogie","DOG"){
        s_TokenCounter = 0;
    }
    function mintNft()public{
        _safeMint(msg.sender,s_TokenCounter);
        s_TokenCounter++;
    }
    function tokenURI(uint256 /*tokenId*/) public pure override returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }
    function getTokenCounter() public view returns(uint256){
        return s_TokenCounter;
    }

}