import './App.css';

import { PrivyProvider } from '@privy-io/react-auth';
import { gnosis } from 'viem/chains'
import Safe from './Safe';


function App() {


  return (
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_ID!}
      onSuccess={() => { }}
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
        },
      }}
    >
      <Safe />
    </PrivyProvider>
  );
}

export default App;
