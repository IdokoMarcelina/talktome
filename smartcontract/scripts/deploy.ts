import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy ENS Registry first
  const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
  const ensRegistry = await ENSRegistry.deploy();
  await ensRegistry.waitForDeployment();

  const ensRegistryAddress = await ensRegistry.getAddress();
  console.log(`ENS Registry deployed to: ${ensRegistryAddress}`);

  // Deploy Chat DApp with ENS Registry address
  const ChatDApp = await ethers.getContractFactory("ChatDApp");
  const chatDApp = await ChatDApp.deploy(ensRegistryAddress);
  await chatDApp.waitForDeployment();

  const chatDAppAddress = await chatDApp.getAddress();
  console.log(`Chat DApp deployed to: ${chatDAppAddress}`);

  // Get the global chat room ID
  const globalChatRoom = await chatDApp.getGlobalChatRoom();
  console.log(`Global Chat Room ID: ${globalChatRoom}`);

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`ENS Registry: ${ensRegistryAddress}`);
  console.log(`Chat DApp: ${chatDAppAddress}`);
  console.log(`Global Chat Room: ${globalChatRoom}`);

  console.log("\n=== FRONTEND CONFIG UPDATE ===");
  console.log("Update frontend/talktome/src/config/contracts.js with these addresses:");
  console.log(`ENS_REGISTRY address: "${ensRegistryAddress}"`);
  console.log(`CHAT_DAPP address: "${chatDAppAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
