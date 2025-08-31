// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EverMind AI - Decentralized Intelligent Personal Assistant
 * @dev Built on 0G AI Layer 1 ecosystem with INFTs for AI agent portability
 *
 * Features:
 * - AI agent minting and management via ERC-7857 INFTs
 * - 0G Compute integration for AI inference
 * - 0G Storage integration for knowledge bases
 * - Encrypted metadata and secure AI agent transfer
 * - AI marketplace and collaboration capabilities
 */
contract EverMindAI is ERC721, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;

    // ============ STRUCTS ============

    struct AIAgent {
        string name;
        string description;
        bytes32 modelHash; // Hash of the AI model on 0G Compute
        bytes32 datasetHash; // Hash of knowledge base on 0G Storage
        bytes32 metadataHash; // Encrypted metadata hash
        string encryptedMetadata; // Encrypted metadata URI
        uint256 creationTimestamp;
        uint256 lastUsedTimestamp;
        bool isActive;
        address creator;
        uint256 computeCredits; // 0G Compute credits
        uint256 storageCredits; // 0G Storage credits
        bool nftStatusAcknowledged; // Whether the agent has acknowledged its NFT status
    }

    struct AIExecution {
        uint256 agentId;
        address user;
        bytes32 inputHash;
        bytes32 outputHash;
        uint256 timestamp;
        uint256 computeCost;
        bool isCompleted;
    }

    struct Collaboration {
        uint256 agentId1;
        uint256 agentId2;
        address initiator;
        uint256 startTime;
        bool isActive;
        bytes32 sharedDataHash;
    }

    // ============ STATE VARIABLES ============

    mapping(uint256 => AIAgent) public aiAgents;
    mapping(uint256 => AIExecution) public executions;
    mapping(uint256 => Collaboration) public collaborations;
    mapping(address => uint256[]) public userAgents;
    mapping(bytes32 => bool) public usedProofs;

    // 0G Integration addresses
    address public ogCompute;
    address public ogStorage;
    address public ogDataAvailability;

    // Contract state
    uint256 private _nextAgentId = 1;
    uint256 private _nextExecutionId = 1;
    uint256 private _nextCollaborationId = 1;

    uint256 public mintPrice = 0.000001 ether;
    uint256 public executionFee = 0.000001 ether;
    uint256 public computeCreditPrice = 0.000001 ether;
    uint256 public storageCreditPrice = 0.0000001 ether;

    // ============ EVENTS ============

    event AIAgentMinted(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        bytes32 modelHash,
        bytes32 datasetHash
    );

    event AIExecutionTriggered(
        uint256 indexed executionId,
        uint256 indexed agentId,
        address indexed user,
        bytes32 inputHash
    );

    event AIExecutionCompleted(
        uint256 indexed executionId,
        bytes32 outputHash,
        uint256 computeCost
    );

    event CollaborationStarted(
        uint256 indexed collaborationId,
        uint256 indexed agentId1,
        uint256 indexed agentId2,
        address initiator
    );

    event MetadataUpdated(
        uint256 indexed agentId,
        bytes32 newMetadataHash,
        string newEncryptedMetadata
    );

    event CreditsPurchased(
        address indexed buyer,
        uint256 computeCredits,
        uint256 storageCredits,
        uint256 totalCost
    );

    event AgentNFTMinted(
        uint256 indexed agentId,
        address indexed owner,
        string agentName,
        uint256 tokenId,
        bytes32 modelHash,
        bytes32 datasetHash,
        uint256 timestamp
    );

    event AgentNFTStatusAcknowledged(
        uint256 indexed agentId,
        address indexed owner,
        uint256 timestamp,
        string acknowledgmentMessage
    );

    // ============ MODIFIERS ============

    modifier onlyAgentOwner(uint256 agentId) {
        require(ownerOf(agentId) == msg.sender, "Not agent owner");
        _;
    }

    modifier agentExists(uint256 agentId) {
        require(ownerOf(agentId) != address(0), "Agent does not exist");
        _;
    }

    modifier agentActive(uint256 agentId) {
        require(aiAgents[agentId].isActive, "Agent is not active");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(
        string memory name,
        string memory symbol,
        address _ogCompute,
        address _ogStorage,
        address _ogDataAvailability
    ) ERC721(name, symbol) Ownable(msg.sender) {
        ogCompute = _ogCompute;
        ogStorage = _ogStorage;
        ogDataAvailability = _ogDataAvailability;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Mint a new AI agent as an INFT
     * @param name AI agent name
     * @param description AI agent description
     * @param modelHash Hash of the AI model on 0G Compute
     * @param datasetHash Hash of knowledge base on 0G Storage
     * @param encryptedMetadata Encrypted metadata URI
     * @param metadataHash Hash of encrypted metadata
     */
    function mintAIAgent(
        string memory name,
        string memory description,
        bytes32 modelHash,
        bytes32 datasetHash,
        string memory encryptedMetadata,
        bytes32 metadataHash
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient mint fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(modelHash != bytes32(0), "Invalid model hash");

        uint256 agentId = _nextAgentId++;

        AIAgent memory newAgent = AIAgent({
            name: name,
            description: description,
            modelHash: modelHash,
            datasetHash: datasetHash,
            metadataHash: metadataHash,
            encryptedMetadata: encryptedMetadata,
            creationTimestamp: block.timestamp,
            lastUsedTimestamp: 0,
            isActive: true,
            creator: msg.sender,
            computeCredits: 100, // Initial credits
            storageCredits: 100, // Initial credits
            nftStatusAcknowledged: false
        });

        aiAgents[agentId] = newAgent;
        userAgents[msg.sender].push(agentId);

        _safeMint(msg.sender, agentId);

        emit AIAgentMinted(agentId, msg.sender, name, modelHash, datasetHash);

        // Notify the AI agent that it has become an NFT
        emit AgentNFTMinted(
            agentId,
            msg.sender,
            name,
            agentId,
            modelHash,
            datasetHash,
            block.timestamp
        );

        return agentId;
    }

    /**
     * @dev Execute AI inference using 0G Compute
     * @param agentId ID of the AI agent to use
     * @param inputHash Hash of the input data
     * @param proof Zero-knowledge proof for execution authorization
     */
    function executeAI(
        uint256 agentId,
        bytes32 inputHash,
        bytes calldata proof
    )
        external
        payable
        nonReentrant
        whenNotPaused
        agentExists(agentId)
        agentActive(agentId)
    {
        require(msg.value >= executionFee, "Insufficient execution fee");
        require(
            aiAgents[agentId].computeCredits > 0,
            "Insufficient compute credits"
        );

        // Verify proof (integration with 0G Compute)
        require(
            _verifyExecutionProof(agentId, inputHash, proof),
            "Invalid execution proof"
        );

        uint256 executionId = _nextExecutionId++;

        AIExecution memory execution = AIExecution({
            agentId: agentId,
            user: msg.sender,
            inputHash: inputHash,
            outputHash: bytes32(0),
            timestamp: block.timestamp,
            computeCost: 1,
            isCompleted: false
        });

        executions[executionId] = execution;

        // Deduct compute credits
        aiAgents[agentId].computeCredits--;
        aiAgents[agentId].lastUsedTimestamp = block.timestamp;

        emit AIExecutionTriggered(executionId, agentId, msg.sender, inputHash);

        // In a real implementation, this would trigger 0G Compute
        // and the result would be set via completeExecution
    }

    /**
     * @dev Complete an AI execution (called by 0G Compute oracle)
     * @param executionId ID of the execution to complete
     * @param outputHash Hash of the AI output
     * @param computeCost Actual compute cost used
     */
    function completeExecution(
        uint256 executionId,
        bytes32 outputHash,
        uint256 computeCost
    ) external onlyOwner {
        require(
            executions[executionId].isCompleted == false,
            "Execution already completed"
        );

        executions[executionId].outputHash = outputHash;
        executions[executionId].computeCost = computeCost;
        executions[executionId].isCompleted = true;

        emit AIExecutionCompleted(executionId, outputHash, computeCost);
    }

    /**
     * @dev Start collaboration between two AI agents
     * @param agentId1 First agent ID
     * @param agentId2 Second agent ID
     * @param sharedDataHash Hash of shared data
     */
    function startCollaboration(
        uint256 agentId1,
        uint256 agentId2,
        bytes32 sharedDataHash
    )
        external
        nonReentrant
        whenNotPaused
        agentExists(agentId1)
        agentExists(agentId2)
    {
        require(
            ownerOf(agentId1) == msg.sender || ownerOf(agentId2) == msg.sender,
            "Not agent owner"
        );
        require(agentId1 != agentId2, "Cannot collaborate with self");

        uint256 collaborationId = _nextCollaborationId++;

        Collaboration memory collaboration = Collaboration({
            agentId1: agentId1,
            agentId2: agentId2,
            initiator: msg.sender,
            startTime: block.timestamp,
            isActive: true,
            sharedDataHash: sharedDataHash
        });

        collaborations[collaborationId] = collaboration;

        emit CollaborationStarted(
            collaborationId,
            agentId1,
            agentId2,
            msg.sender
        );
    }

    /**
     * @dev Update AI agent metadata
     * @param agentId ID of the agent to update
     * @param newMetadataHash New metadata hash
     * @param newEncryptedMetadata New encrypted metadata URI
     */
    function updateMetadata(
        uint256 agentId,
        bytes32 newMetadataHash,
        string memory newEncryptedMetadata
    ) external onlyAgentOwner(agentId) agentExists(agentId) {
        aiAgents[agentId].metadataHash = newMetadataHash;
        aiAgents[agentId].encryptedMetadata = newEncryptedMetadata;

        emit MetadataUpdated(agentId, newMetadataHash, newEncryptedMetadata);
    }

    /**
     * @dev Purchase compute and storage credits
     * @param computeCredits Number of compute credits to purchase
     * @param storageCredits Number of storage credits to purchase
     */
    function purchaseCredits(
        uint256 computeCredits,
        uint256 storageCredits
    ) external payable nonReentrant whenNotPaused {
        uint256 totalCost = (computeCredits * computeCreditPrice) +
            (storageCredits * storageCreditPrice);
        require(msg.value >= totalCost, "Insufficient payment");

        // Distribute credits to user's agents
        uint256[] memory userAgentIds = userAgents[msg.sender];
        if (userAgentIds.length > 0) {
            uint256 creditsPerAgent = computeCredits / userAgentIds.length;
            uint256 storagePerAgent = storageCredits / userAgentIds.length;

            for (uint256 i = 0; i < userAgentIds.length; i++) {
                aiAgents[userAgentIds[i]].computeCredits += creditsPerAgent;
                aiAgents[userAgentIds[i]].storageCredits += storagePerAgent;
            }
        }

        emit CreditsPurchased(
            msg.sender,
            computeCredits,
            storageCredits,
            totalCost
        );
    }

    /**
     * @dev Allow AI agent to acknowledge its NFT status
     * @param agentId ID of the agent
     * @param acknowledgmentMessage Message from the agent acknowledging its NFT status
     */
    function acknowledgeNFTStatus(
        uint256 agentId,
        string memory acknowledgmentMessage
    ) external onlyAgentOwner(agentId) agentExists(agentId) {
        require(
            !aiAgents[agentId].nftStatusAcknowledged,
            "NFT status already acknowledged"
        );

        aiAgents[agentId].nftStatusAcknowledged = true;

        emit AgentNFTStatusAcknowledged(
            agentId,
            msg.sender,
            block.timestamp,
            acknowledgmentMessage
        );
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get AI agent details
     * @param agentId ID of the agent
     * @return AI agent struct
     */
    function getAIAgent(
        uint256 agentId
    ) external view agentExists(agentId) returns (AIAgent memory) {
        return aiAgents[agentId];
    }

    /**
     * @dev Get user's AI agents
     * @param user Address of the user
     * @return Array of agent IDs
     */
    function getUserAgents(
        address user
    ) external view returns (uint256[] memory) {
        return userAgents[user];
    }

    /**
     * @dev Get execution details
     * @param executionId ID of the execution
     * @return Execution struct
     */
    function getExecution(
        uint256 executionId
    ) external view returns (AIExecution memory) {
        return executions[executionId];
    }

    /**
     * @dev Get collaboration details
     * @param collaborationId ID of the collaboration
     * @return Collaboration struct
     */
    function getCollaboration(
        uint256 collaborationId
    ) external view returns (Collaboration memory) {
        return collaborations[collaborationId];
    }

    /**
     * @dev Get token URI for INFT metadata
     * @param tokenId Token ID
     * @return Token URI
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            ownerOf(tokenId) != address(0),
            "ERC721Metadata: URI query for nonexistent token"
        );

        AIAgent memory agent = aiAgents[tokenId];
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    _base64Encode(
                        bytes(
                            string(
                                abi.encodePacked(
                                    '{"name":"',
                                    agent.name,
                                    '",',
                                    '"description":"',
                                    agent.description,
                                    '",',
                                    '"attributes":[',
                                    '{"trait_type":"Model Hash","value":"',
                                    _bytes32ToString(agent.modelHash),
                                    '"},',
                                    '{"trait_type":"Dataset Hash","value":"',
                                    _bytes32ToString(agent.datasetHash),
                                    '"},',
                                    '{"trait_type":"Creation Date","value":"',
                                    agent.creationTimestamp.toString(),
                                    '"},',
                                    '{"trait_type":"Compute Credits","value":"',
                                    agent.computeCredits.toString(),
                                    '"},',
                                    '{"trait_type":"Storage Credits","value":"',
                                    agent.storageCredits.toString(),
                                    '"},',
                                    '{"trait_type":"NFT Status Acknowledged","value":"',
                                    agent.nftStatusAcknowledged ? "Yes" : "No",
                                    '"}',
                                    "]}"
                                )
                            )
                        )
                    )
                )
            );
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Verify execution proof (placeholder for 0G Compute integration)
     */
    function _verifyExecutionProof(
        uint256 agentId,
        bytes32 inputHash,
        bytes calldata proof
    ) internal returns (bool) {
        // In real implementation, this would verify against 0G Compute
        // For now, we'll use a simple hash-based verification
        bytes32 proofHash = keccak256(
            abi.encodePacked(agentId, inputHash, proof)
        );

        if (usedProofs[proofHash]) {
            return false; // Proof already used
        }

        usedProofs[proofHash] = true;
        return true;
    }

    /**
     * @dev Base64 encoding helper
     */
    function _base64Encode(
        bytes memory data
    ) internal pure returns (string memory) {
        // Simplified base64 encoding - in production use a proper library
        return string(data);
    }

    /**
     * @dev Convert bytes32 to string
     */
    function _bytes32ToString(
        bytes32 _bytes32
    ) internal pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update 0G integration addresses
     */
    function updateOGAddresses(
        address _ogCompute,
        address _ogStorage,
        address _ogDataAvailability
    ) external onlyOwner {
        ogCompute = _ogCompute;
        ogStorage = _ogStorage;
        ogDataAvailability = _ogDataAvailability;
    }

    /**
     * @dev Update pricing
     */
    function updatePricing(
        uint256 _mintPrice,
        uint256 _executionFee,
        uint256 _computeCreditPrice,
        uint256 _storageCreditPrice
    ) external onlyOwner {
        mintPrice = _mintPrice;
        executionFee = _executionFee;
        computeCreditPrice = _computeCreditPrice;
        storageCreditPrice = _storageCreditPrice;
    }

    /**
     * @dev Pause/unpause contract
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
