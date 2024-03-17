import { Button, Flex, Text } from '@chakra-ui/react'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import React from 'react'
import Login from '../Login'
import { gnosis } from 'viem/chains';
import Dashboard from '../Dashboard';

const Main = () => {
    // const [embeddedWallet, setEmbeddedWallet] = React.useState<any>(null);
    const [smartAccountClient, setSmartAccountClient] = React.useState<any>(null);

    const handleLoginSuccess = (walletData : any) => {
        console.log(walletData)
        setSmartAccountClient(walletData);
        console.log("Seteo SA en Main")
    };
    return (
        <>
            {!smartAccountClient?.account?.address ? (
                <PrivyProvider
                    appId={process.env.REACT_APP_PRIVY_ID!}
                    onSuccess={() => {}}
                    config={{
                        appearance: {
                            theme: '#425047',
                            accentColor: '#A7C080'
                        },
                        defaultChain: gnosis,
                        supportedChains: [gnosis],
                        embeddedWallets: {
                            createOnLogin: 'users-without-wallets',
                            noPromptOnSignature: true
                        }
                    }}
                >
                    <Login onLoginSuccess={handleLoginSuccess} />
                </PrivyProvider>
            ) : (
                <Dashboard smartAccount={smartAccountClient}/>
            )}
        </>
    );
}

export default Main