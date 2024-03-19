/**
 * Tenderly web3 action to call Safe Module every time a user receives sDAI
 */
const ethers = require('ethers');

const safeModule = await context.secrets.get('SAFE_MODULE');
const eurE = "0xcB444e90D8198415266c6a2724b7900fb12FC56E"

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/gnosis');
const abi = '[{"inputs":[{"internalType":"address","name":"_tenderlySigner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TransferToGnosisExecuted","type":"event"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"internalType":"struct SwapModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"configUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_userToSwap","type":"address"}],"name":"executeSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"internalType":"struct SwapModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"modifyUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"safeConfigs","outputs":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tenderlySigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]'

const actionFn = async (context, alertEvent) => {
    const privateKey = await context.secrets.get('EURE_PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, provider);

    result = searchLog(alertEvent)

    if (result[1] !== 0) {
        await callSwap(result, wallet);
    }
}

const searchLog = (jsonData) => {
    const logFound = jsonData.logs.find(log => {
        return log.address.toLowerCase() === eurE.toLowerCase();
    });

    return logFound ? [logFound.topics[2].replace(/^0x0+/, '0x'), parseInt(logFound.data.substring(0, 66), 16)] : ["", 0];
}

const callSwap = async (logs, wallet) => {
    const contract = new ethers.Contract(safeModule, abi, wallet);
    const amount = ethers.utils.formatEther(logs[1].toString());

    try {
        const result = await contract.executeSwap(ethers.utils.parseEther(amount), logs[0]);
        console.log('Success :', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Do not change this.
module.exports = { actionFn }