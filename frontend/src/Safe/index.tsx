/**
 * This entire file, is not used. Used only for understanding the Safe Modules and Pimlico interaction.
 */

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
            safeModules: [process.env.REACT_APP_SAFE_MODULE]
        })

        console.log('safeAccount: ', safeAccount.address)

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

        console.log(smartAccountClient)
        console.log(smartAccountClient.account.address)

        setSmartAccountClient(smartAccountClient)
    }
    
    const executeTx = async () => {
        console.log("transaction init")
        const configABI = [{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"internalType":"struct SwapModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"modifyUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"}]
        
        if(smartAccountClient){
            let encodedData = encodeFunctionData({
                abi: configABI,
                functionName: 'modifyUserSafe',
                args: [{
                    tokenIn: "0xaf204776c7245bF4147c2612BF6e5972Ee483701",
                    tokenOut: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
                    gnosisPayAccount: "0xEBB6ef1254FACf43F387ADF9301cBdE5f2035205",
                    safeAddress: smartAccountClient.account.address
                }]
            }) as `0x${string}`

    
            const txHash = await smartAccountClient.sendTransaction({
                to: process.env.REACT_APP_SAFE_MODULE,
                value: BigInt(0),
                data: encodedData
            })
    
            console.log(txHash)
        }

    }

    return (
        <div>
            DRAFT
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
            <button
                onClick={executeTx}>
                Store Safe config
            </button>

        </div>
    )
}

export default index