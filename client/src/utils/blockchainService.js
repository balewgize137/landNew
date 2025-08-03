import { ethers } from 'ethers';
import LandRegistryArtifact from '../contracts/LandRegistry.json';

// Paste your new contract address here
const contractAddress = "0x6E488d4cdf23be529f65638109DfA6A6F2fCdC85";
const contractABI = LandRegistryArtifact.abi;

let contract;
let signer;

export const connectWalletAndContract = async () => {
    if (!window.ethereum) {
        alert("Please install MetaMask.");
        throw new Error("No crypto wallet found.");
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request wallet connection
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        return { signer, contract };
    } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw new Error("Wallet connection failed.");
    }
};

export const getContract = () => {
    if (!contract) throw new Error("Contract not initialized.");
    return contract;
};