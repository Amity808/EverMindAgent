# 0G Storage Integration Setup

This guide explains how to configure and use the 0G Storage TypeScript SDK in the EverMind AI platform.

## 🔧 Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# 0G Storage Configuration
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai/
NEXT_PUBLIC_0G_INDEXER_RPC=https://indexer-storage-testnet-standard.0g.ai

# IPFS Configuration (Fallback)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here

# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_CHAIN_ID=your_chain_id_here

# Wallet Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here
```

## 🚀 Getting Started

### 1. Install Dependencies

The required dependencies are already installed:

- `@0glabs/0g-ts-sdk`: 0G Storage TypeScript SDK
- `ethers`: Ethereum library for wallet management

### 2. Configure 0G Storage

The storage service is configured to use 0G Storage by default. You can customize the configuration by creating a new instance:

```typescript
import { StorageService } from "@/lib/storage";

const customStorage = new StorageService({
  provider: "0g",
  rpcUrl: "https://evmrpc-testnet.0g.ai/",
  indexerRpc: "https://indexer-storage-testnet-standard.0g.ai",
});
```

### 3. Upload Files

```typescript
import { storageService } from "@/lib/storage";

// Upload an AI model
const modelFile = new File([modelData], "model.pth", {
  type: "application/octet-stream",
});
const result = await storageService.uploadFile(modelFile, {
  type: "ai-model",
  framework: "pytorch",
  version: "1.0.0",
});

console.log("Upload result:", result);
// {
//   hash: '0x...', // Root hash from merkle tree
//   url: 'https://0g-storage.com/0x...',
//   size: 1234567,
//   type: 'application/octet-stream',
//   transactionHash: '0x...' // Transaction hash
// }
```

## 📁 How It Works

### Upload Process

1. **File Conversion**: File is converted to Buffer for ZgFile creation
2. **Merkle Tree Generation**: SDK generates a merkle tree for the file
3. **Upload to 0G Storage**: File is uploaded using the indexer
4. **Hash Generation**: Root hash is extracted from the merkle tree
5. **Transaction Confirmation**: Transaction hash is returned

### File Structure

```
lib/
├── storage.ts          # Main storage service
├── model-metadata.ts   # Model metadata extraction
└── utils.ts           # Utility functions
```

## 🔍 Supported File Types

### AI Models

- **PyTorch**: `.pt`, `.pth`, `.pkl`
- **TensorFlow**: `.h5`, `.keras`, `.pb`
- **ONNX**: `.onnx`
- **Hugging Face**: `.bin`, `.safetensors`
- **CoreML**: `.mlmodel`
- **TensorFlow Lite**: `.tflite`

### Datasets

- **JSON**: `.json`, `.jsonl`
- **CSV**: `.csv`
- **Text**: `.txt`
- **Parquet**: `.parquet`
- **Arrow**: `.arrow`, `.feather`

## 🛠️ API Reference

### StorageService Class

#### Constructor

```typescript
new StorageService(config: StorageConfig)
```

#### Methods

##### uploadFile(file: File, metadata?: Record<string, any>): Promise<UploadResult>

Uploads a file to the configured storage provider.

**Parameters:**

- `file`: The file to upload
- `metadata`: Optional metadata to attach to the file

**Returns:**

- `UploadResult`: Object containing hash, URL, size, type, and transaction hash

##### downloadFile(hash: string, outputPath?: string): Promise<Buffer | null>

Downloads a file from 0G Storage using its hash.

**Parameters:**

- `hash`: The root hash of the file
- `outputPath`: Optional output path for the file

**Returns:**

- `Buffer | null`: The file data as a buffer

##### validateFile(file: File, maxSize: number, allowedTypes: string[]): { valid: boolean; error?: string }

Validates a file before upload.

**Parameters:**

- `file`: The file to validate
- `maxSize`: Maximum allowed size in MB
- `allowedTypes`: Array of allowed file extensions

**Returns:**

- `{ valid: boolean; error?: string }`: Validation result

## 🔒 Security Considerations

1. **Wallet Integration**: Uses user's connected wallet - no private keys stored
2. **File Validation**: Always validate files before upload
3. **Size Limits**: Implement appropriate size limits for different file types
4. **Error Handling**: Proper error handling for network failures

## 🐛 Troubleshooting

### Common Issues

1. **"0G Storage not properly initialized"**

   - Ensure user wallet is connected
   - Verify the RPC URLs are correct

2. **"Upload failed"**

   - Check network connectivity
   - Verify the user's wallet has sufficient funds
   - Check file size limits

3. **"Merkle tree generation failed"**
   - Ensure the file is not corrupted
   - Check file format compatibility

### Debug Mode

Enable debug logging by setting:

```bash
NEXT_PUBLIC_DEBUG=true
```

## 📚 Additional Resources

- [0G Storage Documentation](https://docs.0g.ai/)
- [0G Storage TypeScript SDK](https://github.com/0glabs/0g-ts-sdk)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [0G Storage TypeScript SDK Starter Kit](https://github.com/0glabs/0g-storage-ts-starter-kit)

## 🤝 Contributing

If you encounter issues or have suggestions for improvement, please:

1. Check the troubleshooting section
2. Review the 0G Storage documentation
3. Create an issue with detailed error information
