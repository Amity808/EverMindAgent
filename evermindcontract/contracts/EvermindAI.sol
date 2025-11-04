// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ResearchHistory
 * @dev Smart contract for storing research chat history on blockchain
 * @author Evermind AI
 */
contract ResearchHistory is Ownable, ReentrancyGuard {
    // Events
    event ResearchSessionCreated(
        uint256 indexed sessionId,
        address indexed researcher,
        string indexed researchType,
        uint256 timestamp
    );

    event ResearchQueryAdded(
        uint256 indexed sessionId,
        uint256 indexed queryId,
        string query,
        string context,
        uint256 timestamp
    );

    event ResearchResponseAdded(
        uint256 indexed sessionId,
        uint256 indexed queryId,
        string ipfsHash,
        string verificationHash,
        uint256 timestamp
    );

    event ResearchSessionCompleted(
        uint256 indexed sessionId,
        uint256 totalQueries,
        uint256 totalCost,
        uint256 timestamp
    );

    // Structs
    struct ResearchQuery {
        uint256 queryId;
        string query;
        string context;
        uint256 timestamp;
        bool hasResponse;
    }

    struct ResearchResponse {
        uint256 queryId;
        string ipfsHash; // IPFS hash for full response data
        string verificationHash; // Hash for verification
        uint256 cost; // Cost in OG tokens
        uint256 timestamp;
        bool verified;
    }

    struct ResearchSession {
        uint256 sessionId;
        address researcher;
        string researchType;
        uint256 startTime;
        uint256 endTime;
        uint256 totalQueries;
        uint256 totalCost;
        bool isActive;
        mapping(uint256 => ResearchQuery) queries;
        mapping(uint256 => ResearchResponse) responses;
    }

    // State variables
    uint256 private _nextSessionId;
    uint256 private _nextQueryId;
    mapping(uint256 => ResearchSession) private _sessions;
    mapping(address => uint256[]) private _researcherSessions;
    mapping(string => uint256) private _ipfsHashToQueryId;

    // Constants
    uint256 public constant MAX_QUERIES_PER_SESSION = 100;
    uint256 public constant STORAGE_FEE = 0.001 ether; // 0.001 ETH per session

    // Modifiers
    modifier onlyActiveSession(uint256 sessionId) {
        require(_sessions[sessionId].isActive, "Session not active");
        _;
    }

    modifier validSessionOwner(uint256 sessionId) {
        require(
            _sessions[sessionId].researcher == msg.sender,
            "Not session owner"
        );
        _;
    }

    constructor() Ownable() {}

    /**
     * @dev Create a new research session
     * @param researchType Type of research (academic, market, technical, competitive)
     */
    function createResearchSession(
        string memory researchType
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= STORAGE_FEE, "Insufficient storage fee");
        require(bytes(researchType).length > 0, "Research type required");

        uint256 sessionId = _nextSessionId++;

        ResearchSession storage session = _sessions[sessionId];
        session.sessionId = sessionId;
        session.researcher = msg.sender;
        session.researchType = researchType;
        session.startTime = block.timestamp;
        session.isActive = true;

        _researcherSessions[msg.sender].push(sessionId);

        emit ResearchSessionCreated(
            sessionId,
            msg.sender,
            researchType,
            block.timestamp
        );

        return sessionId;
    }

    /**
     * @dev Add a research query to an active session
     * @param sessionId The session ID
     * @param query The research query
     * @param context Additional context
     */
    function addResearchQuery(
        uint256 sessionId,
        string memory query,
        string memory context
    )
        external
        onlyActiveSession(sessionId)
        validSessionOwner(sessionId)
        returns (uint256)
    {
        require(bytes(query).length > 0, "Query cannot be empty");
        require(
            _sessions[sessionId].totalQueries < MAX_QUERIES_PER_SESSION,
            "Max queries reached"
        );

        uint256 queryId = _nextQueryId++;

        ResearchQuery storage researchQuery = _sessions[sessionId].queries[
            queryId
        ];
        researchQuery.queryId = queryId;
        researchQuery.query = query;
        researchQuery.context = context;
        researchQuery.timestamp = block.timestamp;

        _sessions[sessionId].totalQueries++;

        emit ResearchQueryAdded(
            sessionId,
            queryId,
            query,
            context,
            block.timestamp
        );

        return queryId;
    }

    /**
     * @dev Add a research response to a query
     * @param sessionId The session ID
     * @param queryId The query ID
     * @param ipfsHash IPFS hash of the response data
     * @param verificationHash Hash for verification
     * @param cost Cost in OG tokens
     */
    function addResearchResponse(
        uint256 sessionId,
        uint256 queryId,
        string memory ipfsHash,
        string memory verificationHash,
        uint256 cost
    ) external onlyActiveSession(sessionId) validSessionOwner(sessionId) {
        require(
            _sessions[sessionId].queries[queryId].queryId != 0,
            "Query not found"
        );
        require(
            !_sessions[sessionId].queries[queryId].hasResponse,
            "Response already exists"
        );
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(
            bytes(verificationHash).length > 0,
            "Verification hash required"
        );

        ResearchResponse storage response = _sessions[sessionId].responses[
            queryId
        ];
        response.queryId = queryId;
        response.ipfsHash = ipfsHash;
        response.verificationHash = verificationHash;
        response.cost = cost;
        response.timestamp = block.timestamp;
        response.verified = true;

        _sessions[sessionId].queries[queryId].hasResponse = true;
        _sessions[sessionId].totalCost += cost;
        _ipfsHashToQueryId[ipfsHash] = queryId;

        emit ResearchResponseAdded(
            sessionId,
            queryId,
            ipfsHash,
            verificationHash,
            block.timestamp
        );
    }

    /**
     * @dev Complete a research session
     * @param sessionId The session ID
     */
    function completeResearchSession(
        uint256 sessionId
    ) external onlyActiveSession(sessionId) validSessionOwner(sessionId) {
        _sessions[sessionId].isActive = false;
        _sessions[sessionId].endTime = block.timestamp;

        emit ResearchSessionCompleted(
            sessionId,
            _sessions[sessionId].totalQueries,
            _sessions[sessionId].totalCost,
            block.timestamp
        );
    }

    /**
     * @dev Get research session details
     * @param sessionId The session ID
     */
    function getResearchSession(
        uint256 sessionId
    )
        external
        view
        returns (
            uint256 sessionId_,
            address researcher,
            string memory researchType,
            uint256 startTime,
            uint256 endTime,
            uint256 totalQueries,
            uint256 totalCost,
            bool isActive
        )
    {
        ResearchSession storage session = _sessions[sessionId];
        return (
            session.sessionId,
            session.researcher,
            session.researchType,
            session.startTime,
            session.endTime,
            session.totalQueries,
            session.totalCost,
            session.isActive
        );
    }

    /**
     * @dev Get research query details
     * @param sessionId The session ID
     * @param queryId The query ID
     */
    function getResearchQuery(
        uint256 sessionId,
        uint256 queryId
    )
        external
        view
        returns (
            uint256 queryId_,
            string memory query,
            string memory context,
            uint256 timestamp,
            bool hasResponse
        )
    {
        ResearchQuery storage researchQuery = _sessions[sessionId].queries[
            queryId
        ];
        return (
            researchQuery.queryId,
            researchQuery.query,
            researchQuery.context,
            researchQuery.timestamp,
            researchQuery.hasResponse
        );
    }

    /**
     * @dev Get research response details
     * @param sessionId The session ID
     * @param queryId The query ID
     */
    function getResearchResponse(
        uint256 sessionId,
        uint256 queryId
    )
        external
        view
        returns (
            uint256 queryId_,
            string memory ipfsHash,
            string memory verificationHash,
            uint256 cost,
            uint256 timestamp,
            bool verified
        )
    {
        ResearchResponse storage response = _sessions[sessionId].responses[
            queryId
        ];
        return (
            response.queryId,
            response.ipfsHash,
            response.verificationHash,
            response.cost,
            response.timestamp,
            response.verified
        );
    }

    /**
     * @dev Get all session IDs for a researcher
     * @param researcher The researcher address
     */
    function getResearcherSessions(
        address researcher
    ) external view returns (uint256[] memory) {
        return _researcherSessions[researcher];
    }

    /**
     * @dev Verify response integrity
     * @param sessionId The session ID
     * @param queryId The query ID
     * @param responseData The response data to verify
     */
    function verifyResponse(
        uint256 sessionId,
        uint256 queryId,
        string memory responseData
    ) external view returns (bool) {
        ResearchResponse storage response = _sessions[sessionId].responses[
            queryId
        ];
        if (response.queryId == 0) return false;

        // Simple hash verification (in production, use proper cryptographic verification)
        string memory calculatedHash = string(abi.encodePacked(responseData));
        return
            keccak256(bytes(calculatedHash)) ==
            keccak256(bytes(response.verificationHash));
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        payable(owner()).transfer(balance);
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

