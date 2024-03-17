import './App.css';
import { PrivyProvider } from '@privy-io/react-auth';
import { gnosis } from 'viem/chains'
import { ChakraProvider } from '@chakra-ui/react'
import Main from './Main';
import Safe from './Safe'
// import Dashboard from './Dashboard';


function App() {
  return (
      <ChakraProvider>
        <Main />
      </ChakraProvider>
  );
}

export default App;
