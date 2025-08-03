import React, { useState } from 'react';

// --- Step 1: Make sure all these files exist ---
import { connectWalletAndContract } from '../utils/blockchainService';

// This is the component for the actual forms.
const LandServices = () => {
    // --- Step 2: Add state for wallet and forms ---
    const [account, setAccount] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('add');

    // State for all three forms
    const [addLandData, setAddLandData] = useState({ location: '', size: '' });
    const [transferData, setTransferData] = useState({ toAddress: '', landId: '' });
    const [permissionData, setPermissionData] = useState({ landId: '' });

    // --- Step 3: Add the logic to connect and submit ---
    const handleConnectWallet = async () => {
        try {
            const { signer } = await connectWalletAndContract();
            setAccount(await signer.getAddress());
            setError(''); // Clear previous errors
        } catch (err) {
            setError("Failed to connect wallet. Please ensure MetaMask is installed and running.");
            console.error(err);
        }
    };

    const handleFormSubmit = async (e, type) => {
        e.preventDefault();
        if (!account) {
            setError("Please connect your wallet first.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const { contract } = await connectWalletAndContract();

            // Simplified user registration for this example
            try {
                const registerTx = await contract.registerUser("Client User", "Land Owner");
                await registerTx.wait();
            } catch (userRegError) {
                console.log("User already registered, continuing...");
            }

            let transaction;
            if (type === 'add') {
                transaction = await contract.registerLand(addLandData.location, addLandData.size);
            } else if (type === 'transfer') {
                transaction = await contract.transferLand(transferData.toAddress, transferData.landId);
            } else if (type === 'permission') {
                // Note: In a real app, this form would be on the admin panel
                transaction = await contract.grantBuildingPermission(permissionData.landId);
            }
            
            await transaction.wait();
            alert(`Success! Your transaction for '${type}' was confirmed.`);
            
        } catch (err) {
            const reason = err.reason || "Check console for details.";
            setError(`Transaction Failed: ${reason}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Step 4: This renders the correct form based on the active tab ---
    const renderForm = () => {
        switch (activeTab) {
            case 'transfer':
                return (
                    <form onSubmit={(e) => handleFormSubmit(e, 'transfer')} className="space-y-4">
                        <input name="toAddress" onChange={(e) => setTransferData({...transferData, toAddress: e.target.value})} placeholder="Recipient Address" className="w-full p-2 border rounded" required />
                        <input name="landId" type="number" onChange={(e) => setTransferData({...transferData, landId: e.target.value})} placeholder="Land ID" className="w-full p-2 border rounded" required />
                        <button type="submit" disabled={loading || !account} className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">Transfer Land</button>
                    </form>
                );
            case 'permission':
                return (
                     <form onSubmit={(e) => handleFormSubmit(e, 'permission')} className="space-y-4">
                        <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-md mb-4">Note: This action can only be performed by the contract owner (the address that deployed the contract).</p>
                        <input name="landId" type="number" onChange={(e) => setPermissionData({...permissionData, landId: e.target.value})} placeholder="Land ID to grant permission" className="w-full p-2 border rounded" required/>
                        <button type="submit" disabled={loading || !account} className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">Grant Building Permission</button>
                    </form>
                );
            case 'add':
            default:
                return (
                    <form onSubmit={(e) => handleFormSubmit(e, 'add')} className="space-y-4">
                         <input name="location" onChange={(e) => setAddLandData({...addLandData, location: e.target.value})} placeholder="Land Location (e.g., District, City)" className="w-full p-2 border rounded" required />
                         <input name="size" type="number" onChange={(e) => setAddLandData({...addLandData, size: e.target.value})} placeholder="Land Size (sqm)" className="w-full p-2 border rounded" required />
                        <button type="submit" disabled={loading || !account} className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">Register New Land</button>
                    </form>
                );
        }
    };

    // --- Step 5: This is the UI with the Connect Wallet button ---
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Land Services Portal</h1>
                {account ? (
                    <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm shadow-sm">
                        ✅ Connected: <span className="font-mono">{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span>
                    </div>
                ) : (
                    <button onClick={handleConnectWallet} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
                        Connect Wallet
                    </button>
                )}
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('add')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'add' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Add New Land</button>
                    <button onClick={() => setActiveTab('transfer')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transfer' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Transfer Land</button>
                    <button onClick={() => setActiveTab('permission')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'permission' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Building Permission</button>
                </nav>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
                {renderForm()}
                {!account && <p className="text-center text-sm text-gray-500 mt-2">Please connect your wallet to use these services.</p>}
                {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};

export default LandServices;