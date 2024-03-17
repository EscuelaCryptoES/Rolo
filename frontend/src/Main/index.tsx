import { PrivyProvider } from '@privy-io/react-auth';
import React from 'react'
import Login from '../Login'
import { gnosis } from 'viem/chains';
import Dashboard from '../Dashboard';

const Main = () => {
    const [smartAccountClient, setSmartAccountClient] = React.useState<any>(null);

    const handleLoginSuccess = (walletData : any) => {
        setSmartAccountClient(walletData);
    };

    return (
        <>
            {!smartAccountClient?.account?.address ? (
                <PrivyProvider
                    appId={process.env.REACT_APP_PRIVY_ID!}
                    onSuccess={() => {}}
                    config={{
                        appearance: {
                            theme: '#ffffff',
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
