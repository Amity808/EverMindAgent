export const RESEARCH_HISTORY_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "query",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "context",
                "type": "string"
            }
        ],
        "name": "addResearchQuery",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "queryId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "verificationHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "cost",
                "type": "uint256"
            }
        ],
        "name": "addResearchResponse",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            }
        ],
        "name": "completeResearchSession",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "researchType",
                "type": "string"
            }
        ],
        "name": "createResearchSession",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "queryId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "query",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "context",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "ResearchQueryAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "queryId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "verificationHash",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "ResearchResponseAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalQueries",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalCost",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "ResearchSessionCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "researcher",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "string",
                "name": "researchType",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "ResearchSessionCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "researcher",
                "type": "address"
            }
        ],
        "name": "getResearcherSessions",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "queryId",
                "type": "uint256"
            }
        ],
        "name": "getResearchQuery",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "queryId_",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "query",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "context",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "hasResponse",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "queryId",
                "type": "uint256"
            }
        ],
        "name": "getResearchResponse",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "queryId_",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "verificationHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "cost",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            }
        ],
        "name": "getResearchSession",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "sessionId_",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "researcher",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "researchType",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "startTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalQueries",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalCost",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_QUERIES_PER_SESSION",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "STORAGE_FEE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "sessionId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "queryId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "responseData",
                "type": "string"
            }
        ],
        "name": "verifyResponse",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
