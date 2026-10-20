import { readFileSync } from "fs";
import path from "path";
import {
  TransactionHash,
  TransactionStatus,
  GenLayerClient,
  DecodedDeployData,
  GenLayerChain,
} from "genlayer-js/types";
import { localnet } from "genlayer-js/chains";

export default async function main(client: GenLayerClient<any>) {
  const filePath = path.resolve(process.cwd(), "contracts/stakedtakes.py");

  try {
    const contractCode = new Uint8Array(readFileSync(filePath));

    await client.initializeConsensusSmartContract();

  
    const admin = "0x9dCFF04fafC8e7cAC8c0A70DB61f2E33166dDFB6";
    const treasury = "0x9dCFF04fafC8e7cAC8c0A70DB61f2E33166dDFB6";
    const protocolFeeBps = 150;                  // 1.5%
    const rewardBps = 500;                     
    const appealWindowMs = 48 * 60 * 60 * 1000;  // 48 hours
    const appealBond = 5;                        
    const minStake = 10;                         
    const retractWindowMs = 15 * 60 * 1000;      

    const deployTransaction = await client.deployContract({
      code: contractCode,
      args: [
        admin,
        treasury,
        protocolFeeBps,
        rewardBps,
        appealWindowMs,
        appealBond,
        minStake,
        retractWindowMs,
      ],
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: deployTransaction as TransactionHash,
      status: TransactionStatus.ACCEPTED,
      retries: 200,
    });

    if (
      receipt.status !== 5 &&
      receipt.status !== 6 &&
      receipt.statusName !== "ACCEPTED" &&
      receipt.statusName !== "FINALIZED"
    ) {
      throw new Error(`Deployment failed. Receipt: ${JSON.stringify(receipt)}`);
    }

    const deployedContractAddress =
      (client.chain as GenLayerChain).id === localnet.id
        ? receipt.data.contract_address
        : (receipt.txDataDecoded as DecodedDeployData)?.contractAddress;

    console.log(`Contract deployed at address: ${deployedContractAddress}`);
  } catch (error) {
    throw new Error(`Error during deployment: ${error}`);
  }
}