// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IGatewayCallback
 * @notice Interface for contracts receiving Gateway decryption callbacks
 * @dev Implement these functions to handle async decryption results
 */
interface IGatewayCallback {
    /**
     * @notice Callback for validation results
     * @param requestId Unique request identifier
     * @param decryptedValid Whether validation passed
     */
    function callbackValidation(uint256 requestId, bool decryptedValid) external;

    /**
     * @notice Callback for average rating calculation
     * @param requestId Unique request identifier
     * @param decryptedScaledSum Decrypted scaled sum
     * @param decryptedCount Decrypted count
     * @return average Calculated average
     */
    function callbackAverageRating(
        uint256 requestId,
        uint128 decryptedScaledSum,
        uint64 decryptedCount
    ) external returns (uint256 average);
}

/**
 * @title IPrivacyFeedback
 * @notice Main interface for PrivacyFeedbackSystem
 */
interface IPrivacyFeedback {
    // Enums
    enum FeedbackStatus {
        Pending,
        Processing,
        Completed,
        Failed,
        Refunded,
        TimedOut
    }

    enum DecryptionType {
        FeedbackSubmission,
        StatisticsCalculation,
        AverageComputation,
        PriceReveal
    }

    // Structs
    struct Feedback {
        address submitter;
        uint256 timestamp;
        uint256 requestId;
        FeedbackStatus status;
        uint256 expiryTime;
        uint256 refundAmount;
    }

    struct DecryptionRequest {
        uint256 feedbackId;
        address requester;
        uint256 timestamp;
        uint256 expiryTime;
        DecryptionType requestType;
        bool processed;
    }

    // Events
    event FeedbackSubmitted(
        uint256 indexed feedbackId,
        address indexed submitter,
        uint256 requestId,
        uint256 timestamp
    );

    event FeedbackProcessed(
        uint256 indexed feedbackId,
        uint256 indexed requestId,
        FeedbackStatus status
    );

    event DecryptionRequested(
        uint256 indexed requestId,
        uint256 indexed feedbackId,
        DecryptionType requestType
    );

    event DecryptionCompleted(uint256 indexed requestId, bool success);

    event RefundIssued(
        uint256 indexed feedbackId,
        address indexed user,
        uint256 amount,
        string reason
    );

    event TimeoutTriggered(uint256 indexed feedbackId, uint256 indexed requestId);

    event StatisticsUpdated(uint256 timestamp, uint256 totalFeedbacks);

    // Core functions
    function submitFeedback(
        bytes calldata encryptedRating,
        bytes calldata encryptedSentiment,
        bytes calldata encryptedPrice,
        bytes calldata inProof
    ) external payable returns (uint256 feedbackId);

    function requestAverageRating() external returns (uint256 requestId);

    function claimTimeoutRefund(uint256 feedbackId) external;

    function emergencyRefund(uint256 feedbackId, string calldata reason) external;

    // View functions
    function getUserFeedbackCount(address user) external view returns (uint256);

    function getUserFeedbackIds(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory);

    function getUserTotalRefunds(address user) external view returns (uint256);

    function isRequestExpired(uint256 requestId) external view returns (bool);
}

/**
 * @title IRefundManager
 * @notice Interface for refund management
 */
interface IRefundManager {
    event RefundProcessed(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );

    function processRefund(address user, uint256 amount, string calldata reason) external;

    function getPendingRefund(address user) external view returns (uint256);

    function claimRefund() external;
}

/**
 * @title ITimeoutProtection
 * @notice Interface for timeout protection mechanism
 */
interface ITimeoutProtection {
    event TimeoutConfigUpdated(uint256 newTimeout);
    event GracePeriodUpdated(uint256 newGracePeriod);

    function setTimeoutDuration(uint256 duration) external;

    function setGracePeriod(uint256 period) external;

    function checkTimeout(uint256 requestId) external view returns (bool);

    function extendTimeout(uint256 requestId, uint256 extension) external;
}
