import React from 'react'
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect } from "react";

import { ENTRYPOINT_ADDRESS_V06, createSmartAccountClient, walletClientToSmartAccountSigner, bundlerActions } from "permissionless";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico"
import { signerToSafeSmartAccount } from "permissionless/accounts"
import { Account, Address, createClient, createPublicClient, encodeFunctionData, http } from 'viem';

import { createWalletClient, custom } from 'viem';
import { gnosis, gnosisChiado } from 'viem/chains';

const publicClient = createPublicClient({
    transport: http("https://rpc.ankr.com/gnosis"),
})

const bundlerClient = createClient({
    chain: gnosis,
    transport: http(`https://api.pimlico.io/v1/gnosis/rpc?apikey=${process.env.REACT_APP_PIMLICO_ID}`),
})
.extend(bundlerActions(ENTRYPOINT_ADDRESS_V06))
.extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V06))

const paymasterClient = createClient({
    chain: gnosis,
    transport: http(`https://api.pimlico.io/v2/gnosis/rpc?apikey=${process.env.REACT_APP_PIMLICO_ID}`),
}).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V06))

const index = () => {
    const { ready, authenticated, login } = usePrivy();
    const { wallets } = useWallets();
    const [embeddedWallet, setEmbeddedWallet] = React.useState<any>(null);
    const [smartAccountClient, setSmartAccountClient] = React.useState<any>(null);

    useEffect(() => {
        console.log(wallets)
        if (wallets.length > 0 && ready && authenticated) {
            handleCreateSmartContract()
        }
    }, [wallets])    
    
    const handleCreateSmartContract = async () => {
        
        console.log(wallets)
        const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === "privy"
        )!;
        setEmbeddedWallet(embeddedWallet);

        const eip1193provider = await embeddedWallet.getEthereumProvider();

        const privyClient = createWalletClient({
            account: embeddedWallet.address as unknown as Account,
            chain: gnosis,
            transport: custom(eip1193provider)
        });

        const signer = walletClientToSmartAccountSigner(privyClient);

        const safeAccount = await signerToSafeSmartAccount(publicClient, {
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            signer: signer,
            safeVersion: "1.4.1",
            safeModules: ['0x295eD188b953Cc724F879714C5B27C7DfeeAB487']
        })

        console.log('safeAccount: ', safeAccount.address)

        // const smartAccountClient = createSmartAccountClient({
        //     account: safeAccount,
        //     entryPoint: ENTRYPOINT_ADDRESS_V06,
        //     chain: gnosis,
        //     bundlerTransport: http(`https://api.pimlico.io/v1/gnosis/rpc?apikey=${process.env.REACT_APP_PIMLICO_ID}`),
        //     middleware: {
        //         gasPrice: async () => (await bundlerClient.getUserOperationGasPrice()).fast,
        //         sponsorUserOperation: paymasterClient.sponsorUserOperation,
        //     },
        // })

        const smartAccountClient = createSmartAccountClient({
            account: safeAccount,
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            chain: gnosis,
            bundlerTransport: http(`https://api.pimlico.io/v1/gnosis/rpc?apikey=${process.env.REACT_APP_PIMLICO_ID}`),
            middleware: {
                gasPrice: async () => (await bundlerClient.getUserOperationGasPrice()).fast,
                sponsorUserOperation: ({ userOperation }) => {
                    return paymasterClient.sponsorUserOperation({
                        userOperation,
                        sponsorshipPolicyId: 'sp_material_reptil'
                    })
                },
            },
        })

        // console.log('smartAccountClient: ', smartAccountClient)

        //
        // const gasPrices = await bundlerClient.getUserOperationGasPrice()

        // console.log(gasPrices)

        console.log("transaction init")

        // const SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985"

        // const factory = SIMPLE_ACCOUNT_FACTORY_ADDRESS
        // const factoryData = encodeFunctionData({
        //     abi: [
        //         {
        //             inputs: [
        //                 { name: "owner", type: "address" },
        //                 { name: "salt", type: "uint256" },
        //             ],
        //             name: "createAccount",
        //             outputs: [{ name: "ret", type: "address" }],
        //             stateMutability: "nonpayable",
        //             type: "function",
        //         },
        //     ],
        //     args: [signer.address, BigInt(0)],
        // })

        // console.log("Generated factoryData:", factoryData)

        // const senderAddress = safeAccount.address

        // const to = "0x13dab84D0c05ca0a0A94606bb75f9f5476a4704B"
        // const value = BigInt(0)
        // const data = "0x68656c6c6f"

        // const callData = encodeFunctionData({
        //     abi: [
        //         {
        //             inputs: [
        //                 { name: "dest", type: "address" },
        //                 { name: "value", type: "uint256" },
        //                 { name: "func", type: "bytes" },
        //             ],
        //             name: "execute",
        //             outputs: [],
        //             stateMutability: "nonpayable",
        //             type: "function",
        //         },
        //     ],
        //     args: [to, value, data],
        // })
        
        // console.log("Generated callData:", callData)
        
        // const gasPrice = await bundlerClient.getUserOperationGasPrice()

        // console.log(gasPrice)

        // const userOperation = {
        //     sender: senderAddress,
        //     nonce: BigInt(0),
        //     factory: factory as Address,
        //     factoryData,
        //     callData,
        //     maxFeePerGas: gasPrice.fast.maxFeePerGas,
        //     maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
        //     // dummy signature, needs to be there so the SimpleAccount doesn't immediately revert because of invalid signature length
        //     signature:
        //         "0xa15569dd8f8324dbeabf8073fdec36d4b754f53ce5901e283c6de79af177dc94557fa3c9922cd7af2a96ca94402d35c39f266925ee6407aeb32b31d76978d4ba1c" as Hex,
        // }
        
        // const sponsorUserOperationResult = await paymasterClient.sponsorUserOperation({
        //     userOperation,
        //     sponsorshipPolicyId: 'sp_material_reptil'
        // })

        // const sponsoredUserOperation: UserOperation<"v0.7"> = {
        //     ...userOperation,
        //     ...sponsorUserOperationResult,
        // }
        
        // console.log("Received paymaster sponsor result:", sponsorUserOperationResult)

        ////////////////////////////////////////////////////////////////////

        // call to configUserSafe(struct address tokenin, address tokenout, address gnosiscard) (MODULE) and approve of input token (hardcoded at begginng) spender address of unique module, amount max.

        const configABI = [{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"}],"internalType":"struct SafeERC20TransferModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"configUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"}]

        // const contractAddress = '0x13dab84D0c05ca0a0A94606bb75f9f5476a4704B';
        // const provider = new JsonRpcProvider('https://rpc.ankr.com/gnosis');
        // const contract = new Contract(contractAddress, configABI, provider);

        // // Usar la interfaz para codificar los datos de la función transferFrom
        // const iface = new Interface(configABI);
        let encodedData = encodeFunctionData({
            abi: configABI,
            functionName: 'configUserSafe',
            args: [{
                tokenIn:"0x13dab84D0c05ca0a0A94606bb75f9f5476a4704B",
                tokenOut:"0x13dab84D0c05ca0a0A94606bb75f9f5476a4704B",
                gnosisPayAccount:"0x295eD188b953Cc724F879714C5B27C7DfeeAB487"
            }]
        }) as `0x${string}`

        const txHash = await smartAccountClient.sendTransaction({
            to: '0x295eD188b953Cc724F879714C5B27C7DfeeAB487',
            value: BigInt(0),
            data: encodedData
        })

        console.log(txHash)


        // const args = {
        //     tokenIn: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
        //     tokenOut: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
        //     gnosisPayAccount: "0x786c729F87702fc7C8c651495B6C71f467069Cfd"
        // }
        // const encodedCall = encodeFunctionData({
        //     abi: configABI,
        //     functionName: 'userSafeConfig',
        //     args: [[args]]
        // })

        // console.log(encodedCall)
        // const txHash = await smartAccountClient.sendTransaction({
        //     to: '0x295eD188b953Cc724F879714C5B27C7DfeeAB487',
        //     value: BigInt(0),
        //     data: '0x',
        // })

        // console.log('txHash: ', txHash)
    }

    return (
        <div>
            <button
                onClick={login}
            >
                Login with Privy
            </button>

            <div>
                {embeddedWallet?.address ?? 'Loading...'}
            </div>

            <button
                onClick={handleCreateSmartContract}
            >
                Create Smart Wallet
            </button>

        </div>
    )
}

export default index