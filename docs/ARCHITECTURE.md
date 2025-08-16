# Privacy Feedback System Architecture

## Overview

Advanced privacy-preserving feedback system built on Fully Homomorphic Encryption (FHE) technology with Gateway callback pattern for asynchronous decryption operations.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Features](#core-features)
3. [Technical Innovations](#technical-innovations)
4. [Security Features](#security-features)
5. [Gas Optimization](#gas-optimization)
6. [API Reference](#api-reference)
7. [Deployment Guide](#deployment-guide)
8. [Usage Examples](#usage-examples)

---

## Architecture Overview

### High-Level Architecture

```
User → Submit Encrypted Feedback → Smart Contract → Gateway
                                         ↓              ↓
                                    Store Data    Decrypt
                                         ↓              ↓
                                    Wait Callback ← Callback
                                         ↓
                                    Process Result
                                         ↓
                                Complete or Refund
```

### Components

#### 1. **PrivacyFeedbackSystem.sol**
Main contract implementing:
- UUPS upgradeable proxy pattern
- Gateway callback integration
- Refund mechanism
- Timeout protection
- Privacy-preserving operations

#### 2. **Gateway Integration**
Handles asynchronous FHE operations:
- Decryption requests
- Callback management
- Request timeout tracking

#### 3. **Access Control**
Role-based permissions:
- **DEFAULT_ADMIN_ROLE**: System administration
- **PAUSER_ROLE**: Emergency pause capability
- **UPGRADER_ROLE**: Contract upgrade authority
- **MODERATOR_ROLE**: Refund and moderation functions

---

## Core Features

### 1. Gateway Callback Mode

**Problem**: Synchronous decryption is expensive and blocks execution.

**Solution**: Asynchronous Gateway callback pattern.

**Flow**:
```solidity
// User submits encrypted data
submitFeedback(encryptedRating, encryptedSentiment, encryptedPrice, proof)
    ↓
// Contract requests Gateway decryption
requestId = Gateway.requestDecryption(cts, callback, timeout)
    ↓
// Gateway decrypts off-chain
Gateway processes encrypted data
    ↓
// Gateway calls back with result
callbackValidation(requestId, decryptedResult)
    ↓
// Contract processes based on result
Process or Refund
```

**Benefits**:
- Reduced gas costs
- Non-blocking operations
- Improved UX

### 2. Refund Mechanism

**Scenarios for Automatic Refunds**:

1. **Invalid Input**: Rating outside valid range (1-5)
2. **Decryption Failure**: Gateway unable to process
3. **Timeout Exceeded**: Request not processed within 24 hours
4. **Emergency Refund**: Moderator-initiated refund

**Implementation**:
```solidity
function _issueRefund(uint256 feedbackId, string memory reason) private {
    Feedback storage feedback = feedbacks[feedbackId];
    uint256 amount = feedback.refundAmount;
    address recipient = feedback.submitter;

    feedback.refundAmount = 0;
    feedback.status = FeedbackStatus.Refunded;

    (bool success, ) = recipient.call{value: amount}("");
    if (!success) revert RefundFailed();

    emit RefundIssued(feedbackId, recipient, amount, reason);
}
```

**User-Initiated Timeout Refund**:
```solidity
function claimTimeoutRefund(uint256 feedbackId) external {
    require(block.timestamp > feedback.expiryTime, "Not yet expired");
    _issueRefund(feedbackId, "Timeout");
}
```

### 3. Timeout Protection

**Configuration**:
- Default timeout: 24 hours
- Grace period: 1 hour
- Auto-refund on expiry

**Protection Against**:
- Permanent fund locking
- Stuck requests
- Gateway failures

**Monitoring**:
```solidity
function isRequestExpired(uint256 requestId) public view returns (bool) {
    return block.timestamp > decryptionRequests[requestId].expiryTime;
}
```

---

## Technical Innovations

### 1. Division Privacy Protection

**Challenge**: Division operations can leak information about encrypted values.

**Solution**: Random multiplier technique.

**Implementation**:
```solidity
// Instead of: average = sum / count
// Use: obfuscatedAverage = (sum * randomMultiplier) / count

euint128 scaledSum = TFHE.asEuint128(
    TFHE.mul(statistics.sumRatings, statistics.randomMultiplier)
);

statistics.obfuscatedAverage = scaledSum;

// Later, during decryption:
actualAverage = decryptedScaledSum / (decryptedCount * multiplierValue);
```

**Benefits**:
- Prevents information leakage from division
- Maintains privacy of individual values
- Accurate results after de-obfuscation

**Random Multiplier Generation**:
```solidity
function _generateRandomMultiplier() private view returns (euint64) {
    uint64 multiplier = uint64(
        MIN_MULTIPLIER + (uint256(keccak256(
            abi.encodePacked(block.timestamp, block.prevrandao)
        )) % (MAX_MULTIPLIER - MIN_MULTIPLIER))
    );
    return TFHE.asEuint64(multiplier);
}
```

### 2. Price Obfuscation

**Challenge**: Encrypted prices may reveal patterns.

**Solution**: Add deterministic noise.

**Implementation**:
```solidity
function _obfuscatePrice(euint128 price) private view returns (euint128) {
    // Generate noise based on block properties
    uint128 noise = uint128(
        uint256(keccak256(
            abi.encodePacked(block.timestamp, block.prevrandao)
        )) % 1000
    );

    // Add encrypted noise to price
    return TFHE.add(price, TFHE.asEuint128(noise));
}
```

**Benefits**:
- Prevents price pattern analysis
- Maintains relative ordering
- Reversible for authorized parties

### 3. Asynchronous Processing

**Gateway Callback Pattern**:

```solidity
// Step 1: Submit and request decryption
function submitFeedback(...) external payable returns (uint256 feedbackId) {
    // Validate and encrypt
    euint32 rating = TFHE.asEuint32(encryptedRating, inProof);

    // Request decryption
    uint256 requestId = Gateway.requestDecryption(
        cts,
        this.callbackValidation.selector,
        0,
        block.timestamp + TIMEOUT_DURATION,
        false
    );

    // Store request
    decryptionRequests[requestId] = DecryptionRequest({...});
}

// Step 2: Gateway calls back
function callbackValidation(
    uint256 requestId,
    bool decryptedValid
) public onlyGateway {
    // Process result
    if (decryptedValid) {
        _updateStatistics(feedbackId);
    } else {
        _issueRefund(feedbackId, "Invalid rating");
    }
}
```

---

## Security Features

### 1. Input Validation

**Multi-Layer Validation**:

```solidity
// Layer 1: Payment validation
if (msg.value < SUBMISSION_FEE) revert InsufficientFee();

// Layer 2: Encrypted range validation
ebool validMin = TFHE.ge(rating, TFHE.asEuint32(MIN_RATING));
ebool validMax = TFHE.le(rating, TFHE.asEuint32(MAX_RATING));
ebool isValid = TFHE.and(validMin, validMax);

// Layer 3: Decryption validation
// Validated via Gateway callback
```

### 2. Access Control

**Role Hierarchy**:

```
DEFAULT_ADMIN_ROLE
    ├── UPGRADER_ROLE
    ├── PAUSER_ROLE
    └── MODERATOR_ROLE
```

**Permission Matrix**:

| Function | Admin | Pauser | Upgrader | Moderator |
|----------|-------|--------|----------|-----------|
| upgrade() | ✓ | ✗ | ✓ | ✗ |
| pause() | ✓ | ✓ | ✗ | ✗ |
| emergencyRefund() | ✓ | ✗ | ✗ | ✓ |
| withdrawFees() | ✓ | ✗ | ✗ | ✗ |

### 3. Overflow Protection

**SafeMath via Solidity 0.8+**:
- Automatic overflow/underflow checks
- Reverts on arithmetic errors

**Custom Overflow Detection**:
```solidity
error OverflowDetected();

// Example in statistics update
if (newSum < oldSum) revert OverflowDetected();
```

### 4. Reentrancy Protection

```solidity
contract PrivacyFeedbackSystem is ReentrancyGuardUpgradeable {
    function submitFeedback(...) external payable nonReentrant {
        // Protected from reentrancy
    }

    function claimTimeoutRefund(...) external nonReentrant {
        // Protected from reentrancy
    }
}
```

### 5. Pausability

**Emergency Pause**:
```solidity
function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
}

function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
}

// All critical functions check pause state
function submitFeedback(...) external whenNotPaused {
    // Function body
}
```

---

## Gas Optimization

### 1. HCU (Homomorphic Computation Unit) Awareness

**HCU Costs** (approximate):

| Operation | HCU Cost |
|-----------|----------|
| asEuint32 | 10 |
| add | 5 |
| mul | 15 |
| ge/le | 8 |
| and | 5 |

**Optimization Strategy**:
```solidity
uint256 public constant MAX_HCU_PER_OPERATION = 100;

// Batch operations to minimize HCU usage
function _updateStatistics(uint256 feedbackId) private {
    // Single add operation instead of multiple
    statistics.totalFeedbacks = TFHE.add(
        statistics.totalFeedbacks,
        TFHE.asEuint64(1)
    );

    // Reuse conversions
    euint64 rating64 = TFHE.asEuint64(feedback.encryptedRating);
    statistics.sumRatings = TFHE.add(statistics.sumRatings, rating64);
}
```

### 2. Storage Optimization

**Packed Structs**:
```solidity
struct Feedback {
    address submitter;           // 160 bits
    euint32 encryptedRating;     // 32 bits (encrypted)
    euint64 encryptedSentiment;  // 64 bits (encrypted)
    euint128 encryptedPrice;     // 128 bits (encrypted)
    string encryptedComment;     // Dynamic
    uint256 timestamp;           // 256 bits
    uint256 requestId;           // 256 bits
    FeedbackStatus status;       // 8 bits
    uint256 expiryTime;          // 256 bits
    uint256 refundAmount;        // 256 bits
}
```

### 3. Event Optimization

**Indexed Parameters** (max 3):
```solidity
event FeedbackSubmitted(
    uint256 indexed feedbackId,
    address indexed submitter,
    uint256 requestId,          // Not indexed - saves gas
    uint256 timestamp           // Not indexed - saves gas
);
```

---

## API Reference

### Core Functions

#### submitFeedback

Submit encrypted feedback with payment.

```solidity
function submitFeedback(
    einput encryptedRating,
    einput encryptedSentiment,
    einput encryptedPrice,
    bytes calldata inProof
) external payable returns (uint256 feedbackId)
```

**Parameters**:
- `encryptedRating`: Encrypted rating (1-5)
- `encryptedSentiment`: Encrypted sentiment score
- `encryptedPrice`: Obfuscated price paid
- `inProof`: FHE input proof

**Returns**: Unique feedback ID

**Payable**: Requires `SUBMISSION_FEE` (0.001 ETH)

**Events**: `FeedbackSubmitted`, `DecryptionRequested`

---

#### requestAverageRating

Request average rating calculation.

```solidity
function requestAverageRating() external returns (uint256 requestId)
```

**Returns**: Request ID for tracking

**Events**: `DecryptionRequested`

---

#### claimTimeoutRefund

Claim refund for timed-out request.

```solidity
function claimTimeoutRefund(uint256 feedbackId) external
```

**Parameters**:
- `feedbackId`: ID of timed-out feedback

**Requirements**:
- Caller must be feedback submitter
- Request must be expired (> 24 hours)
- Status must be Pending or Processing

**Events**: `RefundIssued`, `TimeoutTriggered`

---

#### emergencyRefund

Moderator-initiated refund.

```solidity
function emergencyRefund(
    uint256 feedbackId,
    string calldata reason
) external onlyRole(MODERATOR_ROLE)
```

**Access**: MODERATOR_ROLE only

---

### View Functions

#### getUserFeedbackCount

```solidity
function getUserFeedbackCount(address user)
    external view returns (uint256)
```

#### getUserFeedbackIds

```solidity
function getUserFeedbackIds(
    address user,
    uint256 offset,
    uint256 limit
) external view returns (uint256[] memory)
```

#### getUserTotalRefunds

```solidity
function getUserTotalRefunds(address user)
    external view returns (uint256)
```

#### isRequestExpired

```solidity
function isRequestExpired(uint256 requestId)
    public view returns (bool)
```

---

## Deployment Guide

### Prerequisites

1. **Environment Setup**:
```bash
npm install --save-dev hardhat
npm install @openzeppelin/contracts-upgradeable
npm install fhevm
```

2. **Configure .env**:
```env
PRIVATE_KEY=your-private-key
ADMIN_ADDRESS=0x...
PAUSER_ADDRESS=0x...
ETHERSCAN_API_KEY=your-api-key
RPC_URL=https://sepolia.infura.io/v3/...
```

### Deployment Steps

1. **Compile Contracts**:
```bash
npx hardhat compile
```

2. **Run Tests** (recommended):
```bash
npx hardhat test
```

3. **Deploy to Testnet**:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

4. **Verify on Etherscan**:
```bash
npx hardhat verify --network sepolia <PROXY_ADDRESS>
npx hardhat verify --network sepolia <IMPLEMENTATION_ADDRESS>
```

### Post-Deployment

1. **Update .env**:
```env
PRIVACY_FEEDBACK_PROXY_ADDRESS=0x...
PRIVACY_FEEDBACK_IMPLEMENTATION_ADDRESS=0x...
```

2. **Test Integration**:
```bash
npx hardhat run scripts/test-integration.js --network sepolia
```

---

## Usage Examples

### Example 1: Submit Feedback

```javascript
const { createInstance } = require("fhevmjs");

async function submitFeedback(contract, rating, sentiment, price) {
    // Create FHE instance
    const instance = await createInstance({ chainId, publicKey });

    // Encrypt inputs
    const encryptedRating = instance.encrypt32(rating);
    const encryptedSentiment = instance.encrypt64(sentiment);
    const encryptedPrice = instance.encrypt128(price);

    // Generate proof
    const proof = instance.generateProof();

    // Submit feedback
    const tx = await contract.submitFeedback(
        encryptedRating,
        encryptedSentiment,
        encryptedPrice,
        proof,
        { value: ethers.parseEther("0.001") }
    );

    const receipt = await tx.wait();
    console.log("Feedback submitted:", receipt.logs[0].args.feedbackId);
}
```

### Example 2: Monitor Request Status

```javascript
async function monitorRequest(contract, feedbackId) {
    const feedback = await contract.feedbacks(feedbackId);

    console.log("Status:", feedback.status);
    console.log("Expiry:", new Date(feedback.expiryTime * 1000));

    if (await contract.isRequestExpired(feedback.requestId)) {
        console.log("Request expired - claim refund");
        await contract.claimTimeoutRefund(feedbackId);
    }
}
```

### Example 3: Request Average Rating

```javascript
async function getAverageRating(contract) {
    const tx = await contract.requestAverageRating();
    const receipt = await tx.wait();

    const requestId = receipt.logs[0].args.requestId;
    console.log("Average calculation requested:", requestId);

    // Wait for callback
    contract.on("DecryptionCompleted", (id, success) => {
        if (id.toString() === requestId.toString()) {
            console.log("Average calculated successfully:", success);
        }
    });
}
```

---

## Audit Checklist

- [ ] Input validation on all public functions
- [ ] Access control properly configured
- [ ] Reentrancy guards in place
- [ ] Overflow protection verified
- [ ] Timeout mechanisms tested
- [ ] Refund logic audited
- [ ] Gateway integration secured
- [ ] Gas optimization reviewed
- [ ] Upgrade mechanism tested
- [ ] Emergency procedures documented

---

## Support & Resources

- **Documentation**: This file
- **Smart Contracts**: `/contracts` directory
- **Tests**: `/test` directory
- **Deployment Scripts**: `/scripts` directory

---

**Version**: 1.0.0
**Last Updated**: 2025-11-22
**License**: MIT
