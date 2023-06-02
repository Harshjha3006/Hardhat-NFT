//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
error RandomIpfsNft__NotEnoughEth();
error RandomIpfsNft__OutOfBounds();
error RandomIpfsNft__TransactionFailed();
contract RandomIpfsNft is VRFConsumerBaseV2,ERC721URIStorage,Ownable{

    enum Breed{
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }
    event NftRequested(uint256 indexed requestId,address minter);
    event NftMinted(Breed breed,address minter);

    // chainlink vrf variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    
    // Nft variables
    uint256 private immutable i_mintFee;
    string[3] internal i_dogTokenUris;
    uint256 private s_tokenCounter;
    mapping(uint256 => address) s_requestIdToMinter;
    uint256 private constant MAX_CHANCE = 100;
    string[3] internal s_dogTokenUris;
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint256 mintFee,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_mintFee = mintFee;
        i_callbackGasLimit = callbackGasLimit;
        s_tokenCounter = 0;
        s_dogTokenUris = dogTokenUris;
    }

    function requestNft() public payable returns(uint256 requestId){
        if(msg.value < i_mintFee){
            revert RandomIpfsNft__NotEnoughEth();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToMinter[requestId] = msg.sender;
        emit NftRequested(requestId,msg.sender);
    }
    function fulfillRandomWords(uint256 requestId,uint256[] memory randomWords) internal override{
        uint256 randomNum = randomWords[0] % MAX_CHANCE;
        Breed dogBreed = getBreedFromRandomNum(randomNum);
        address dogOwner = s_requestIdToMinter[requestId];
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter++;
        _safeMint(dogOwner,newTokenId);
        _setTokenURI(newTokenId,s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed,dogOwner);

    }
    function withdraw() public onlyOwner{
        uint256 amount = address(this).balance;
        (bool success,) = payable(msg.sender).call{value : amount}("");
        if(!success){
            revert RandomIpfsNft__TransactionFailed();
        }
    }
    function getBreedFromRandomNum(uint256 randomNum)public pure returns(Breed){
        uint256 [3] memory chanceArray = getChanceArray();
        if(randomNum < chanceArray[0])return Breed(0);
        for(uint256 i = 1;i < chanceArray.length;i++){
            if(randomNum < chanceArray[i]){
                return Breed(i - 1);
            }
        }
        revert RandomIpfsNft__OutOfBounds();
    }
    function getChanceArray() public pure returns(uint256[3] memory){
        return [10,30,MAX_CHANCE];
    }
    function getMintFee() public view returns(uint256){
        return i_mintFee;
    }
    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter;
    }
    function getDogTokenUris(uint256 index) public view returns(string memory){
        return s_dogTokenUris[index];
    }
}