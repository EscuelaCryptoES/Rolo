import React from 'react'
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect } from "react";

import { ENTRYPOINT_ADDRESS_V06, createSmartAccountClient, walletClientToSmartAccountSigner } from "permissionless";

import { signerToSafeSmartAccount } from "permissionless/accounts"
import { Account, createPublicClient, http } from 'viem';

import { createWalletClient, custom } from 'viem';
import { gnosis, gnosisChiado } from 'viem/chains';

import {
    createPimlicoBundlerClient,
    createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico"

const publicClient = createPublicClient({
    transport: http("https://rpc.ankr.com/gnosis"),
})

const bundlerClient = createPimlicoBundlerClient({
    chain: gnosis,
    transport: http(`https://api.pimlico.io/v1/gnosis/rpc?apikey=${process.env.REACT_APP_PIMLICO_ID}`),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
})

const paymasterClient = createPimlicoPaymasterClient({
    chain: gnosis,
    transport: http(`https://api.pimlico.io/v2/gnosis/rpc?apikey=${process.env.REACT_APP_PIMLICO_ID}`),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
})

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
            safeModules: ['0x13dab84D0c05ca0a0A94606bb75f9f5476a4704B']
        })

        console.log('safeAccount: ', safeAccount.address)

        const smartAccountClient = createSmartAccountClient({
            account: safeAccount,
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            chain: gnosis,
            bundlerTransport: http(`https://api.pimlico.io/v1/gnosis/rpc?apikey=${process.env.REACT_APP_PIMLICO_ID}`),
            middleware: {
                gasPrice: async () => (await bundlerClient.getUserOperationGasPrice()).fast,
                sponsorUserOperation: paymasterClient.sponsorUserOperation,
            },
        })

        console.log('smartAccountClient: ', smartAccountClient)

        //
        const gasPrices = await bundlerClient.getUserOperationGasPrice()

        console.log(gasPrices)

        console.log("transaction init")

        ////////////////////////////////////////////////////////////////////

        // call to configUserSafe(struct address tokenin, address tokenout, address gnosiscard) (MODULE) and approve of input token (hardcoded at begginng) spender address of unique module, amount max.

        // const txHash = await smartAccountClient.sendTransaction({
        //     to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        //     value: BigInt(0),
        //     data: "0x0",
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