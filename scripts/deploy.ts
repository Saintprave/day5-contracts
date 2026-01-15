
import { viem } from "hardhat";

async function main() {
  const SimpleStorage = await viem.deployContract("SimpleStorage");
  console.log("SimpleStorage deployed to:", SimpleStorage.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
