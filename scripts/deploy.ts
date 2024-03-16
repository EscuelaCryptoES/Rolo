import { ethers } from "hardhat";

async function main() {
  // Get the ContractFactory for your SafeERC20TransferModule contract
  const SafeERC20TransferModuleFactory = await ethers.getContractFactory("SafeERC20TransferModule");

  // Deploy the contract
  const safeERC20TransferModule = await SafeERC20TransferModuleFactory.deploy("0x7067F319582d59404D39480bbbD1b7D3cC8f0b03");
  
  // Wait for the contract to be deployed
  await safeERC20TransferModule.deployed();

  console.log(`SafeERC20TransferModule deployed to ${safeERC20TransferModule.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});