import React, { useState } from 'react'
import { Avatar, Button, Flex, Input, Select, Text } from '@chakra-ui/react'
import { encodeFunctionData } from 'viem'

const Onboarding = ({ smartAccount, setParams} : any) => {
    const [tokenIn, setTokenIn] = useState("0xaf204776c7245bf4147c2612bf6e5972ee483701")
    const [tokenOut, setTokenOut] = useState("0xcB444e90D8198415266c6a2724b7900fb12FC56E")
    const [gnosisCard, setGnosisCard] = useState("")

    
    const setConfig = async () => {
        const configABI = [{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"address","name":"gnosisPayAccount","type":"address"},{"internalType":"address","name":"safeAddress","type":"address"}],"internalType":"struct SwapModule.swapConfig","name":"userSafeConfig","type":"tuple"}],"name":"modifyUserSafe","outputs":[],"stateMutability":"nonpayable","type":"function"}]
        
        if(smartAccount){
            const encodedData = encodeFunctionData({
                abi: configABI,
                functionName: 'modifyUserSafe',
                args: [{
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                    gnosisPayAccount: gnosisCard,
                    safeAddress: smartAccount.account.address
                }]
            }) as `0x${string}`

    
            // const txHash = await smartAccount.sendTransaction({
            //     to: '0xe6A0875f056D26a8D84D309EB2C6BB2a9606e298',
            //     value: BigInt(0),
            //     data: encodedData
            // })
    
            // console.log(txHash)
        }

        // setParams(gnosisCard)
    }

    const handleGnosisCard = (event : any) => {
        const newValue = event.target.value;
        setGnosisCard(newValue);    
    }

    return (
        <>
            <Avatar size='xl' name='Ivan Murcia' src='/images/avatar.png' />{' '}
            <Text
                fontSize={'30px'}
                fontWeight={600}
                textColor={'#000000'}
            >
                Welcome, Iván
            </Text>
            <Text
                fontSize={'40px'}
                fontWeight={800}
                textColor={'rgba(240, 6, 97, 1)'}
            >
                Let's get you started
            </Text>

            <Select
                placeholder='Select token input'
                value={tokenIn}
            >
                <option value='0xaf204776c7245bf4147c2612bf6e5972ee483701'>sDAI</option>
                <option value='option2'>USDC</option>
            </Select>

            <Select
                placeholder='Select token output (only EURe now)'
                value={tokenOut}
            >
                <option value='0xcB444e90D8198415266c6a2724b7900fb12FC56E'>EURe</option>
                <option value='option2'>GBPe</option>
            </Select>

            <Input
                placeholder='Gnosis Card Address'
                value={gnosisCard}
                onChange={handleGnosisCard}
            />

            <Button
                backgroundColor={'rgba(242, 0, 93, 1)'}
                textColor={'#fff'}
                height={'50px'}
                onClick={setConfig}
            >
                Set up now
            </Button>
        </>
    )
}

export default Onboarding