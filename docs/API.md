# API Documentation

## Privacy Feedback System API Reference

Complete API documentation for the Privacy Feedback System smart contracts.

---

## Table of Contents

1. [Core Functions](#core-functions)
2. [View Functions](#view-functions)
3. [Admin Functions](#admin-functions)
4. [Events](#events)
5. [Errors](#errors)
6. [Types](#types)

---

## Core Functions

### submitFeedback

Submit encrypted feedback with payment.

```solidity
function submitFeedback(
    einput encryptedRating,
    einput encryptedSentiment,
    einput encryptedPrice,
    bytes calldata inProof
) external payable returns (uint256 feedbackId)
```

**Parameters:**
- `encryptedRating` (einput): Encrypted rating value (1-5)
- `encryptedSentiment` (einput): Encrypted sentiment score (0-100)
- `encryptedPrice` (einput): Encrypted price value
- `inProof` (bytes): FHE input proof for validation

**Returns:**
- `feedbackId` (uint256): Unique identifier for the submitted feedback

**Modifiers:**
- `whenNotPaused`: Function cannot be called when contract is paused
- `nonReentrant`: Protection against reentrancy attacks

**Payable:**
- Requires minimum `SUBMISSION_FEE` (0.001 ETH)

**Events Emitted:**
- `FeedbackSubmitted(feedbackId, submitter, requestId, timestamp)`
- `DecryptionRequested(requestId, feedbackId, DecryptionType.FeedbackSubmission)`

**Errors:**
- `InsufficientFee()`: Payment below minimum fee
- `InvalidRating()`: Rating outside valid range (after decryption)

**Example:**

```javascript
const tx = await contract.submitFeedback(
    encryptedRating,
    encryptedSentiment,
    encryptedPrice,
    proof,
    { value: ethers.parseEther("0.001") }
);
```

---

### requestAverageRating

Request calculation of average rating with privacy protection.

```solidity
function requestAverageRating() external returns (uint256 requestId)
```

**Returns:**
- `requestId` (uint256): Gateway request identifier for tracking

**Events Emitted:**
- `DecryptionRequested(requestId, 0, DecryptionType.AverageComputation)`

**Description:**
Initiates asynchronous calculation of average rating using Gateway callback pattern. The average is computed with division privacy protection using random multipliers.

**Example:**

```javascript
const tx = await contract.requestAverageRating();
const receipt = await tx.wait();
const requestId = receipt.logs[0].args.requestId;
```

---

### claimTimeoutRefund

Claim refund for timed-out feedback submission.

```solidity
function claimTimeoutRefund(uint256 feedbackId) external nonReentrant
```

**Parameters:**
- `feedbackId` (uint256): ID of the feedback to claim refund for

**Modifiers:**
- `nonReentrant`: Protection against reentrancy attacks

**Requirements:**
- Caller must be feedback submitter
- Request must be expired (> TIMEOUT_DURATION)
- Status must be Pending or Processing

**Events Emitted:**
- `RefundIssued(feedbackId, user, amount, "Timeout")`
- `TimeoutTriggered(feedbackId, requestId)`

**Errors:**
- `RefundFailed()`: ETH transfer failed

**Example:**

```javascript
await contract.claimTimeoutRefund(feedbackId);
```

---

### emergencyRefund

Moderator-initiated emergency refund.

```solidity
function emergencyRefund(
    uint256 feedbackId,
    string calldata reason
) external onlyRole(MODERATOR_ROLE)
```

**Parameters:**
- `feedbackId` (uint256): Feedback ID to refund
- `reason` (string): Reason for emergency refund

**Access Control:**
- `MODERATOR_ROLE` required

**Events Emitted:**
- `RefundIssued(feedbackId, user, amount, reason)`

**Example:**

```javascript
await contract.emergencyRefund(
    feedbackId,
    "Gateway service disruption"
);
```

---

## View Functions

### getUserFeedbackCount

Get total number of feedbacks submitted by user.

```solidity
function getUserFeedbackCount(address user)
    external view returns (uint256)
```

**Parameters:**
- `user` (address): User address to query

**Returns:**
- Count of feedbacks submitted by user

**Example:**

```javascript
const count = await contract.getUserFeedbackCount(userAddress);
console.log(`User has ${count} feedbacks`);
```

---

### getUserFeedbackIds

Get paginated list of feedback IDs for user.

```solidity
function getUserFeedbackIds(
    address user,
    uint256 offset,
    uint256 limit
) external view returns (uint256[] memory)
```

**Parameters:**
- `user` (address): User address to query
- `offset` (uint256): Starting index
- `limit` (uint256): Maximum number of IDs to return

**Returns:**
- Array of feedback IDs

**Example:**

```javascript
// Get first 10 feedback IDs
const ids = await contract.getUserFeedbackIds(userAddress, 0, 10);

// Get next 10
const moreIds = await contract.getUserFeedbackIds(userAddress, 10, 10);
```

---

### getUserTotalRefunds

Get total refund amount received by user.

```solidity
function getUserTotalRefunds(address user)
    external view returns (uint256)
```

**Parameters:**
- `user` (address): User address to query

**Returns:**
- Total refund amount in wei

**Example:**

```javascript
const refunds = await contract.getUserTotalRefunds(userAddress);
console.log(`Total refunds: ${ethers.formatEther(refunds)} ETH`);
```

---

### isRequestExpired

Check if decryption request has expired.

```solidity
function isRequestExpired(uint256 requestId)
    public view returns (bool)
```

**Parameters:**
- `requestId` (uint256): Request ID to check

**Returns:**
- `true` if expired, `false` otherwise

**Example:**

```javascript
const expired = await contract.isRequestExpired(requestId);
if (expired) {
    console.log("Request expired - eligible for refund");
}
```

---

### feedbacks

Get feedback details.

```solidity
function feedbacks(uint256 feedbackId)
    public view returns (Feedback memory)
```

**Parameters:**
- `feedbackId` (uint256): Feedback ID to query

**Returns:**
- Feedback struct with all details

**Example:**

```javascript
const feedback = await contract.feedbacks(feedbackId);
console.log("Submitter:", feedback.submitter);
console.log("Status:", feedback.status);
console.log("Timestamp:", new Date(feedback.timestamp * 1000));
```

---

## Admin Functions

### pause

Pause all critical contract functions.

```solidity
function pause() external onlyRole(PAUSER_ROLE)
```

**Access Control:**
- `PAUSER_ROLE` required

**Effects:**
- Disables `submitFeedback` and other critical functions

**Example:**

```javascript
await contract.pause();
```

---

### unpause

Unpause contract functions.

```solidity
function unpause() external onlyRole(PAUSER_ROLE)
```

**Access Control:**
- `PAUSER_ROLE` required

**Example:**

```javascript
await contract.unpause();
```

---

### withdrawFees

Withdraw accumulated submission fees.

```solidity
function withdrawFees(
    address recipient,
    uint256 amount
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Parameters:**
- `recipient` (address): Address to receive funds
- `amount` (uint256): Amount to withdraw in wei

**Access Control:**
- `DEFAULT_ADMIN_ROLE` required

**Example:**

```javascript
await contract.withdrawFees(
    treasuryAddress,
    ethers.parseEther("10")
);
```

---

### emergencyWithdraw

Emergency withdrawal of all contract funds.

```solidity
function emergencyWithdraw(address recipient)
    external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Parameters:**
- `recipient` (address): Address to receive all funds

**Access Control:**
- `DEFAULT_ADMIN_ROLE` required

**Example:**

```javascript
await contract.emergencyWithdraw(safeAddress);
```

---

## Events

### FeedbackSubmitted

Emitted when feedback is successfully submitted.

```solidity
event FeedbackSubmitted(
    uint256 indexed feedbackId,
    address indexed submitter,
    uint256 requestId,
    uint256 timestamp
)
```

**Parameters:**
- `feedbackId` (indexed): Unique feedback identifier
- `submitter` (indexed): Address that submitted feedback
- `requestId`: Gateway decryption request ID
- `timestamp`: Block timestamp of submission

---

### FeedbackProcessed

Emitted when feedback processing completes.

```solidity
event FeedbackProcessed(
    uint256 indexed feedbackId,
    uint256 indexed requestId,
    FeedbackStatus status
)
```

**Parameters:**
- `feedbackId` (indexed): Feedback identifier
- `requestId` (indexed): Gateway request identifier
- `status`: Final status (Completed, Failed, etc.)

---

### DecryptionRequested

Emitted when Gateway decryption is requested.

```solidity
event DecryptionRequested(
    uint256 indexed requestId,
    uint256 indexed feedbackId,
    DecryptionType requestType
)
```

---

### DecryptionCompleted

Emitted when Gateway callback completes.

```solidity
event DecryptionCompleted(
    uint256 indexed requestId,
    bool success
)
```

---

### RefundIssued

Emitted when refund is processed.

```solidity
event RefundIssued(
    uint256 indexed feedbackId,
    address indexed user,
    uint256 amount,
    string reason
)
```

---

### TimeoutTriggered

Emitted when timeout refund is claimed.

```solidity
event TimeoutTriggered(
    uint256 indexed feedbackId,
    uint256 indexed requestId
)
```

---

### StatisticsUpdated

Emitted when statistics are recalculated.

```solidity
event StatisticsUpdated(
    uint256 timestamp,
    uint256 totalFeedbacks
)
```

---

## Errors

### InvalidRating

```solidity
error InvalidRating()
```

Rating value outside valid range (1-5).

---

### InsufficientFee

```solidity
error InsufficientFee()
```

Payment below required submission fee.

---

### RequestNotFound

```solidity
error RequestNotFound()
```

Decryption request ID not found.

---

### RequestExpired

```solidity
error RequestExpired()
```

Decryption request exceeded timeout duration.

---

### RequestAlreadyProcessed

```solidity
error RequestAlreadyProcessed()
```

Attempt to process already completed request.

---

### UnauthorizedCallback

```solidity
error UnauthorizedCallback()
```

Callback attempt from non-Gateway address.

---

### RefundFailed

```solidity
error RefundFailed()
```

ETH transfer for refund failed.

---

### OverflowDetected

```solidity
error OverflowDetected()
```

Arithmetic overflow in calculation.

---

### ExcessiveHCUUsage

```solidity
error ExcessiveHCUUsage()
```

Operation exceeds maximum HCU limit.

---

## Types

### FeedbackStatus

Enum representing feedback processing status.

```solidity
enum FeedbackStatus {
    Pending,      // Initial state
    Processing,   // Gateway decrypting
    Completed,    // Successfully processed
    Failed,       // Validation failed
    Refunded,     // Refund issued
    TimedOut      // Request expired
}
```

---

### DecryptionType

Enum for different decryption request types.

```solidity
enum DecryptionType {
    FeedbackSubmission,     // Validating feedback
    StatisticsCalculation,  // Computing statistics
    AverageComputation,     // Calculating average
    PriceReveal            // Revealing price data
}
```

---

### Feedback

Structure storing feedback data.

```solidity
struct Feedback {
    address submitter;
    euint32 encryptedRating;
    euint64 encryptedSentiment;
    euint128 encryptedPrice;
    string encryptedComment;
    uint256 timestamp;
    uint256 requestId;
    FeedbackStatus status;
    uint256 expiryTime;
    uint256 refundAmount;
}
```

---

### DecryptionRequest

Structure for tracking Gateway requests.

```solidity
struct DecryptionRequest {
    uint256 feedbackId;
    address requester;
    uint256 timestamp;
    uint256 expiryTime;
    DecryptionType requestType;
    bool processed;
}
```

---

### Statistics

Privacy-preserving statistics storage.

```solidity
struct Statistics {
    euint64 totalFeedbacks;
    euint64 sumRatings;
    euint128 obfuscatedAverage;
    euint64 randomMultiplier;
    uint256 lastUpdate;
}
```

---

## Constants

```solidity
uint256 public constant MIN_RATING = 1;
uint256 public constant MAX_RATING = 5;
uint256 public constant TIMEOUT_DURATION = 24 hours;
uint256 public constant REFUND_GRACE_PERIOD = 1 hour;
uint256 public constant MAX_FEEDBACK_LENGTH = 1000;
uint256 public constant SUBMISSION_FEE = 0.001 ether;
uint256 public constant MIN_MULTIPLIER = 1000;
uint256 public constant MAX_MULTIPLIER = 10000;
uint256 public constant MAX_HCU_PER_OPERATION = 100;
```

---

## Role Constants

```solidity
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-22
**License**: MIT
