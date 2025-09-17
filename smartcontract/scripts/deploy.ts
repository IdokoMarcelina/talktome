import { ethers } from "hardhat";

async function main() {
  const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
  const ensRegistry = await ENSRegistry.deploy();
  await ensRegistry.waitForDeployment();
  const ensRegistryAddress = await ensRegistry.getAddress();
  console.log("ENSRegistry deployed at:", ensRegistryAddress);

  const ChatDApp = await ethers.getContractFactory("ChatDApp");
  const chatDApp = await ChatDApp.deploy(ensRegistryAddress);
  await chatDApp.waitForDeployment();
  const chatDAppAddress = await chatDApp.getAddress();
  console.log("ChatDApp deployed at:", chatDAppAddress);

  console.log("Deployment complete");
  console.log("ENSRegistry:", ensRegistryAddress);
  console.log("ChatDApp:", chatDAppAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
