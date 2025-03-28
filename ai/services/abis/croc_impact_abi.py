# ai/services/abis/croc_impact_abi.py

CROC_IMPACT_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "base", "type": "address"},
            {"internalType": "address", "name": "quote", "type": "address"},
            {"internalType": "uint256", "name": "poolIdx", "type": "uint256"},
            {"internalType": "bool", "name": "isBuy", "type": "bool"},
            {"internalType": "bool", "name": "inBaseQty", "type": "bool"},
            {"internalType": "uint128", "name": "qty", "type": "uint128"},
            {"internalType": "uint16", "name": "tip", "type": "uint16"},
            {"internalType": "uint128", "name": "limitPrice", "type": "uint128"}
        ],
        "name": "calcImpact",
        "outputs": [
            {"internalType": "int128", "name": "baseFlow", "type": "int128"},
            {"internalType": "int128", "name": "quoteFlow", "type": "int128"},
            {"internalType": "uint128", "name": "finalPrice", "type": "uint128"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]