import './App.css';
import { PrivyProvider } from '@privy-io/react-auth';
import { gnosis } from 'viem/chains'
import { ChakraProvider } from '@chakra-ui/react'
import Main from './Main';
import Safe from './Safe'
// import Dashboard from './Dashboard';


function App() {
  // return (
  //   <PrivyProvider
  //     appId={process.env.REACT_APP_PRIVY_ID!}
  //     onSuccess={() => {}}
  //     config={{
  //         appearance: {
  //             theme: '#425047',
  //             accentColor: '#A7C080'
  //         },
  //         defaultChain: gnosis,
  //         supportedChains: [gnosis],
  //         embeddedWallets: {
  //             createOnLogin: 'users-without-wallets',
  //             noPromptOnSignature: true
  //         }
  //     }}
  //   >
  //     <Safe />
    
  //   </PrivyProvider>
  // )

  return (
      <ChakraProvider>
        <Main />
      </ChakraProvider>
  );
}

export default App;
