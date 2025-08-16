const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Advanced Deployment Script for Privacy Feedback System
 *
 * Features:
 * - UUPS Proxy Pattern with upgrade capability
 * - Gateway callback integration
 * - Role-based access control setup
 * - Refund mechanism configuration
 * - Timeout protection
 * - Automated verification
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network <network-name>
 *
 * Networks: sepolia, mainnet, localhost
 */

async function main() {
    console.log("========================================");
    console.log("Privacy Feedback System Deployment");
    console.log("Advanced FHE with Gateway Callbacks");
    console.log("========================================\n");

    // Get deployment configuration
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Configuration from environment
    const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || deployer.address;
    const PAUSER_ADDRESS = process.env.PAUSER_ADDRESS || deployer.address;
    const UPGRADER_ADDRESS = process.env.UPGRADER_ADDRESS || deployer.address;
    const MODERATOR_ADDRESS = process.env.MODERATOR_ADDRESS || deployer.address;

    console.log("Configuration:");
    console.log("- Admin:", ADMIN_ADDRESS);
    console.log("- Pauser:", PAUSER_ADDRESS);
    console.log("- Upgrader:", UPGRADER_ADDRESS);
    console.log("- Moderator:", MODERATOR_ADDRESS);
    console.log();

    // Step 1: Deploy Implementation
    console.log("Step 1: Deploying Implementation Contract...");
    const PrivacyFeedbackSystem = await ethers.getContractFactory("PrivacyFeedbackSystem");

    const implementation = await PrivacyFeedbackSystem.deploy();
    await implementation.waitForDeployment();
    const implementationAddress = await implementation.getAddress();

    console.log("✓ Implementation deployed to:", implementationAddress);
    console.log();

    // Step 2: Deploy Proxy
    console.log("Step 2: Deploying UUPS Proxy...");

    const initData = PrivacyFeedbackSystem.interface.encodeFunctionData("initialize", [
        ADMIN_ADDRESS,
        PAUSER_ADDRESS
    ]);

    const ERC1967Proxy = await ethers.getContractFactory("@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy");
    const proxy = await ERC1967Proxy.deploy(implementationAddress, initData);
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    console.log("✓ Proxy deployed to:", proxyAddress);
    console.log();

    // Step 3: Get proxy instance
    const system = PrivacyFeedbackSystem.attach(proxyAddress);

    // Step 4: Setup additional roles
    console.log("Step 3: Setting up roles...");

    const UPGRADER_ROLE = await system.UPGRADER_ROLE();
    const MODERATOR_ROLE = await system.MODERATOR_ROLE();

    if (UPGRADER_ADDRESS !== ADMIN_ADDRESS) {
        const tx1 = await system.grantRole(UPGRADER_ROLE, UPGRADER_ADDRESS);
        await tx1.wait();
        console.log("✓ Granted UPGRADER_ROLE to:", UPGRADER_ADDRESS);
    }

    if (MODERATOR_ADDRESS !== ADMIN_ADDRESS) {
        const tx2 = await system.grantRole(MODERATOR_ROLE, MODERATOR_ADDRESS);
        await tx2.wait();
        console.log("✓ Granted MODERATOR_ROLE to:", MODERATOR_ADDRESS);
    }
    console.log();

    // Step 5: Verify deployment
    console.log("Step 4: Verifying deployment...");

    const feedbackCounter = await system.feedbackCounter();
    const timeoutDuration = await system.TIMEOUT_DURATION();
    const submissionFee = await system.SUBMISSION_FEE();

    console.log("✓ Feedback Counter:", feedbackCounter.toString());
    console.log("✓ Timeout Duration:", timeoutDuration.toString(), "seconds (", timeoutDuration / 3600n, "hours)");
    console.log("✓ Submission Fee:", ethers.formatEther(submissionFee), "ETH");
    console.log();

    // Step 6: Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            implementation: implementationAddress,
            proxy: proxyAddress
        },
        roles: {
            admin: ADMIN_ADDRESS,
            pauser: PAUSER_ADDRESS,
            upgrader: UPGRADER_ADDRESS,
            moderator: MODERATOR_ADDRESS
        },
        configuration: {
            timeoutDuration: timeoutDuration.toString(),
            submissionFee: submissionFee.toString(),
            minRating: (await system.MIN_RATING()).toString(),
            maxRating: (await system.MAX_RATING()).toString(),
            refundGracePeriod: (await system.REFUND_GRACE_PERIOD()).toString(),
            maxHCUPerOperation: (await system.MAX_HCU_PER_OPERATION()).toString()
        },
        features: {
            gatewayCallback: true,
            refundMechanism: true,
            timeoutProtection: true,
            divisionPrivacy: true,
            priceObfuscation: true,
            inputValidation: true,
            accessControl: true,
            overflowProtection: true,
            gasOptimization: true
        }
    };

    console.log("========================================");
    console.log("Deployment Summary");
    console.log("========================================");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log();

    // Step 7: Etherscan verification
    if (process.env.ETHERSCAN_API_KEY && hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
        console.log("Step 5: Verifying contracts on Etherscan...");
        console.log("Waiting 30 seconds before verification...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            await hre.run("verify:verify", {
                address: implementationAddress,
                constructorArguments: []
            });
            console.log("✓ Implementation verified on Etherscan");
        } catch (error) {
            console.log("⚠ Verification failed:", error.message);
        }

        try {
            await hre.run("verify:verify", {
                address: proxyAddress,
                constructorArguments: [implementationAddress, initData]
            });
            console.log("✓ Proxy verified on Etherscan");
        } catch (error) {
            console.log("⚠ Verification failed:", error.message);
        }
    }

    console.log("\n========================================");
    console.log("Deployment Complete! 🎉");
    console.log("========================================");
    console.log("\nContract Address (Proxy):", proxyAddress);
    console.log("Implementation Address:", implementationAddress);
    console.log("\n🔒 Privacy Features Enabled:");
    console.log("- Gateway callback mode for async decryption");
    console.log("- Automatic refund for failed operations");
    console.log("- Timeout protection (24 hours default)");
    console.log("- Division privacy with random multipliers");
    console.log("- Price obfuscation techniques");
    console.log("- Comprehensive input validation");
    console.log("- Role-based access control");
    console.log("- Overflow protection");
    console.log("- Gas optimized (HCU aware)");
    console.log("\n📝 Next Steps:");
    console.log("1. Update .env with contract addresses:");
    console.log("   PRIVACY_FEEDBACK_PROXY_ADDRESS=" + proxyAddress);
    console.log("   PRIVACY_FEEDBACK_IMPLEMENTATION_ADDRESS=" + implementationAddress);
    console.log("2. Run integration tests:");
    console.log("   npx hardhat test");
    console.log("3. Configure frontend with new addresses");
    console.log("4. Set up monitoring and alerts");
    console.log("5. Test Gateway callback functionality");
    console.log("6. Verify refund mechanism");
    console.log();

    return {
        proxy: proxyAddress,
        implementation: implementationAddress
    };
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });

module.exports = main;
