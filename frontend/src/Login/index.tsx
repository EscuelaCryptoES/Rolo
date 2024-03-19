import { Button, Flex, Text } from '@chakra-ui/react'
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ENTRYPOINT_ADDRESS_V06, bundlerActions, createSmartAccountClient, walletClientToSmartAccountSigner } from 'permissionless';
import { signerToSafeSmartAccount } from 'permissionless/accounts';
import { pimlicoBundlerActions, pimlicoPaymasterActions } from 'permissionless/actions/pimlico';
import { useEffect } from 'react'
import { Account, createClient, createPublicClient, createWalletClient, custom, encodeFunctionData, http } from 'viem';
import { gnosis } from 'viem/chains';

// Auto-swap Safe Module
const SAFE_MODULE = process.env.REACT_APP_SAFE_MODULE

// Build the clients
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

const Login = ({ onLoginSuccess } : any) => {

    const { ready, authenticated, login } = usePrivy();
    const { wallets } = useWallets();

    // Creates Safe Smart Account if is logged with Privy
    useEffect(() => {
        if (wallets.length > 0 && ready && authenticated) {
            handleCreateSmartContract()
        }
    }, [wallets])

    const handleCreateSmartContract = async () => {
        const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === "privy"
        )!;

        // Signer
        const eip1193provider = await embeddedWallet.getEthereumProvider();

        const privyClient = createWalletClient({
            account: embeddedWallet.address as unknown as Account,
            chain: gnosis,
            transport: custom(eip1193provider)
        });

        const signer = walletClientToSmartAccountSigner(privyClient);

        // Build Safe Smart Account with the Auto-Swap Module
        const safeAccount = await signerToSafeSmartAccount(publicClient, {
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            signer: signer,
            safeVersion: "1.4.1",
            safeModules: [SAFE_MODULE]
        })

        // Client instance
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

        // This configuration must be in Onboarding component, but due to a bug, I'm configuring user info here. Don't forget to use your Gnosis Card address
        const configABI = [{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"internalType":"struct SwapModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"modifyUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"}]

        const encodedData = encodeFunctionData({
            abi: configABI,
            functionName: 'modifyUserSafe',
            args: [{
                tokenIn: "0xaf204776c7245bF4147c2612BF6e5972Ee483701",   // sDAI
                tokenOut: "0xcB444e90D8198415266c6a2724b7900fb12FC56E", //  EURe
                gnosisPayAccount: process.env.REACT_APP_GNOSIS_CARD_ADDRESS,
                safeAddress: smartAccountClient.account.address
            }]
        }) as `0x${string}`


        // Deploy Safe Smart Account
        await smartAccountClient.sendTransaction({
            to: SAFE_MODULE,
            value: BigInt(0),
            data: encodedData
        })

        onLoginSuccess(smartAccountClient)
    }

    return (
        <Flex
            height={'100vh'}
            width={'100vw'}
            backgroundImage={'https://s3-alpha-sig.figma.com/img/7e7b/0546/2469e27c6f6423f53c4ba5c2d04b74f3?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=YYxgvbtWEmlv9ZN9GvWqUMqteqDCtMGkFvGDVEsrOLi~BpNmgcfQBjv~xsmBAqDj6rmqRamr3OyEI9D4IaYWwV~OzxvoI5pke-r67X3YtzxVi7XXCITZ3CUHqCc3nA3cDyXKra6LmW1gaAHVfOGdd9ZP~59PwDax9n~CDxItjbkAOqGyvBzzw2txTQyoA2r4fr-2tMDuDj030~GV8jWVB2Ue2f1BgsUleQY5ukHDaukIBCIBhl2rmvvwvMYm2bjzseNVE6nAyoYyaTXQE-uGsGSbEPHtmpysRVztQLN~zfxP2qE-PvyBFvZQ-HYF2wkKiYNtdXYgVh1jd2bO2TLxjw__'}
            backgroundSize={'cover'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
        >
            <Flex
                height={'690px'}
                width={'690px'}
                backgroundColor={'rgba(88, 130, 193, 0.28)'}
                borderRadius={'40px'}
                padding={'90px'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'center'}
                gap={'20px'}
            >
                <Text
                    fontSize={'40px'}
                    fontWeight={800}
                    textColor={'#fff'}
                >
                    Login
                </Text>

                <Button
                    backgroundColor={'rgba(242, 0, 93, 1)'}
                    textColor={'#fff'}
                    height={'50px'}
                    onClick={login}
                >
                    Login with Privy
                </Button>
            </Flex>
        </Flex>
    )
}

export default Login
