// scripts/deploy.cjs
const fs = require("fs");
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of AcademicCredentials contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  // 1. Deploy the contract
  const AcademicCredentials = await hre.ethers.getContractFactory("AcademicCredentials");
  const contract = await AcademicCredentials.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ AcademicCredentials deployed to:", contractAddress);

  // 2. Authorize the MetaMask account you’ll use
  // 👉 Replace this with your MetaMask address (the one you imported with private key)
  const universityWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 
  const universityName = "My Test University";

  console.log("🎓 Authorizing wallet:", universityWallet);
  const tx = await contract.authorizeUniversity(universityWallet, universityName);
  await tx.wait();
  console.log("✅ Wallet authorized successfully!");

  // 3. Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    universityWallet,
    universityName,
    network: hre.network.name,
  };

  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("📂 Deployment info saved to deployment-info.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
