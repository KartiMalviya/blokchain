# Academic Credentials Verification System

A blockchain-based academic credentials verification system built with Solidity smart contracts, React frontend, and IPFS integration for secure and transparent credential management.

## 🚀 Features

### Smart Contract Features
- **Credential Issuance**: Authorized universities can issue academic credentials on-chain
- **Credential Verification**: Instant verification of credentials using student ID or credential hash
- **Credential Revocation**: Ability to revoke credentials when necessary
- **University Authorization**: Role-based access control for universities
- **Data Privacy**: Only hashed data stored on-chain, detailed documents on IPFS
- **Security**: Built with OpenZeppelin contracts for maximum security

### Frontend Features
- **Modern UI**: Beautiful, responsive interface built with Material-UI
- **Wallet Integration**: MetaMask integration for blockchain interactions
- **Real-time Verification**: Instant credential verification
- **IPFS Integration**: Upload and access additional documents
- **Multi-network Support**: Works on Ethereum, Polygon, and local networks
- **Mobile Responsive**: Optimized for all device sizes

### IPFS Integration
- **Document Storage**: Secure storage of transcripts and additional documents
- **Decentralized**: No single point of failure
- **Immutable**: Documents cannot be tampered with
- **Accessible**: Global access to stored documents

## 🛠️ Technology Stack

### Backend
- **Solidity**: Smart contract development
- **Hardhat**: Development framework and testing
- **OpenZeppelin**: Security-focused smart contract library
- **Ethers.js**: Ethereum library for JavaScript

### Frontend
- **React**: User interface framework
- **Material-UI**: Component library
- **React Router**: Navigation
- **React Toastify**: Notifications
- **Date-fns**: Date formatting

### Storage
- **IPFS**: Decentralized file storage
- **Ethereum/Polygon**: Blockchain storage

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd academic-credentials-verification
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Network Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here

# IPFS Configuration (Optional)
REACT_APP_INFURA_PROJECT_ID=your_infura_project_id
REACT_APP_INFURA_PROJECT_SECRET=your_infura_project_secret

# Contract Configuration
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 4. Compile Smart Contracts

```bash
npm run compile
```

### 5. Run Tests

```bash
npm test
```

### 6. Deploy Smart Contracts

#### Local Development
```bash
# Start local blockchain
npm run node

# In another terminal, deploy contracts
npm run deploy
```

#### Polygon Network
```bash
npm run deploy:polygon
```

### 7. Start Frontend

```bash
# Start the React development server
npm start
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### For Universities

1. **Connect Wallet**: Use MetaMask to connect your wallet
2. **Get Authorization**: Contact the system administrator to get authorized
3. **Issue Credentials**: 
   - Navigate to "Issue Credentials"
   - Fill in student information
   - Upload additional documents (optional)
   - Submit the transaction

### For Verifiers

1. **Connect Wallet**: Use MetaMask to connect your wallet
2. **Search Credentials**:
   - Navigate to "Verify Credentials"
   - Search by Student ID or Credential Hash
   - View credential details and status
   - Access additional documents on IPFS

### For Students

1. **Share Credential Hash**: Share your credential hash with employers
2. **Provide Student ID**: Give your student ID for verification
3. **Access Documents**: Use IPFS links to access additional documents

## 🔧 Configuration

### Smart Contract Configuration

The smart contract can be configured for different networks:

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001
    }
  }
};
```

### IPFS Configuration

Configure IPFS for different providers:

```javascript
// utils/ipfsService.js
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
  }
});
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npx hardhat test test/AcademicCredentials.test.js
```

### Test Coverage
```bash
npx hardhat coverage
```

## 📁 Project Structure

```
academic-credentials-verification/
├── contracts/
│   └── AcademicCredentials.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── AcademicCredentials.test.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── utils/
│   └── ipfsService.js
├── hardhat.config.js
├── package.json
└── README.md
```

## 🔒 Security Features

### Smart Contract Security
- **Access Control**: Only authorized universities can issue credentials
- **Input Validation**: Comprehensive validation of all inputs
- **Reentrancy Protection**: Protection against reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Contract ownership management

### Data Privacy
- **Hashed Storage**: Only hashed data stored on-chain
- **IPFS Integration**: Sensitive documents stored off-chain
- **Minimal On-chain Data**: Only essential data stored on blockchain

## 🌐 Network Support

### Supported Networks
- **Local Development**: Hardhat Network (Chain ID: 1337)
- **Polygon Mainnet**: Production network (Chain ID: 137)
- **Mumbai Testnet**: Test network (Chain ID: 80001)
- **Ethereum Mainnet**: Can be configured (Chain ID: 1)

### Network Configuration
```javascript
// Add to hardhat.config.js for additional networks
networks: {
  ethereum: {
    url: process.env.ETHEREUM_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 1
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Credential analytics dashboard
- **API Integration**: REST API for third-party integrations
- **Mobile App**: Native mobile application
- **Batch Operations**: Bulk credential operations
- **Advanced Search**: Advanced search and filtering
- **Notification System**: Real-time notifications
- **Audit Trail**: Comprehensive audit logging

## 📊 Performance

### Gas Optimization
- Optimized Solidity code for minimal gas usage
- Efficient data structures
- Batch operations where possible

### Frontend Performance
- Lazy loading of components
- Optimized bundle size
- Efficient state management
- Responsive design

## 🔍 Monitoring

### Smart Contract Events
Monitor these events for system activity:
- `CredentialIssued`
- `CredentialRevoked`
- `UniversityAuthorized`
- `UniversityDeauthorized`

### IPFS Monitoring
- File upload success/failure rates
- Access patterns
- Storage usage

---

**Built with ❤️ for the future of academic credential verification**
