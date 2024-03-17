/**
 * Tenderly web3 action to approve every time a user sets its swap config in Safe Module 
 */
const ethers = require('ethers');

const safeModule = "0x948C4431580890524E77B0e9a7998A14025e81E0"
const balancer = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/gnosis');
const abi = '[{"inputs":[{"internalType":"address","name":"_tenderlySigner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"safe","type":"address"},{"indexed":false,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ApproveExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"safe","type":"address"},{"indexed":false,"internalType":"address","name":"tokenIn","type":"address"},{"indexed":false,"internalType":"address","name":"tokenOut","type":"address"},{"indexed":false,"internalType":"address","name":"gnosisPayAccount","type":"address"}],"name":"SafeConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TransferToGnosisExecuted","type":"event"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"internalType":"struct SwapModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"configUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_userSafe","type":"address"}],"name":"executeApprove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_userToSwap","type":"address"}],"name":"executeSimpleSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"internalType":"struct SwapModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"modifyUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"safeConfigs","outputs":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tenderlySigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]'

const actionFn = async (context, alertEvent) => {
    const privateKey = await context.secrets.get('EURE_PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, provider);

    result = searchLog(alertEvent)

    if (result !== "") {
        await callApprove(result, wallet);
    }
}

const searchLog = (jsonData) => {
    const logFound = jsonData.logs.find(log => {
        return log.address.toLowerCase() === safeModule.toLowerCase();
    });

    return logFound ? logFound.data.substring(0,66).replace(/^0x0+/, '0x') : ''
}

const callApprove = async (address, wallet) => {
    const contract = new ethers.Contract(safeModule, abi, wallet);

    try {
        const result = await contract.executeApprove(balancer, ethers.utils.MaxInt256, address);
        console.log('Success :', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Do not change this.
module.exports = { actionFn }