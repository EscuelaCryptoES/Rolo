import React from 'react'
import { Avatar, Button, Flex, Input, Select, Text } from '@chakra-ui/react'

const Onboarding = ({ setIsOnboarding }: any) => {
    return (
        <>
            <Avatar size='xl' name='Christian Nwamba' src='/images/avatar.png' />{' '}
            <Text
                fontSize={'30px'}
                fontWeight={600}
                textColor={'#000000'}
            >
                Welcome, Ivan
            </Text>
            <Text
                fontSize={'40px'}
                fontWeight={800}
                textColor={'rgba(240, 6, 97, 1)'}
            >
                Let's get you started
            </Text>

            <Select
                placeholder='Select option'
                value={'option1'}
            >
                <option value='option1'>USDc</option>
                <option value='option2'>USDT</option>
            </Select>

            <Select
                placeholder='Select option'
                value={'option1'}
            >
                <option value='option1'>EURe</option>
                <option value='option2'>USDT</option>
            </Select>

            <Input
                placeholder='Verifying Address'
            />

            <Button
                backgroundColor={'rgba(242, 0, 93, 1)'}
                textColor={'#fff'}
                height={'50px'}
                onClick={() => setIsOnboarding(false)}
            >
                Set up now
            </Button>
        </>
    )
}

export default Onboarding