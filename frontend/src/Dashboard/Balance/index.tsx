import React from 'react'
import { Avatar, Button, Flex, Image, Input, Select, Text } from '@chakra-ui/react'

const Balance = () => {
    return (
        <>
            <Flex
                flexDirection={'column'}
                gap={'15px'}
            >
                <Avatar size='xl' name='Christian Nwamba' src='/images/avatar.png' />{' '}
                <Text
                    fontSize={'30px'}
                    fontWeight={600}
                    textColor={'#000000'}
                >
                    Welcome, Ivan
                </Text>
                <Flex
                    gap={'20px'}
                >
                    <Image
                        src="https://s3-alpha-sig.figma.com/img/558f/c5a0/ec542b105579eff0bb06e21b88a0470b?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hbcTWDvZQczjpkvOTAyFdozY8zzzHgPRQOcTuHf2kM8CjHwIjiaLMmZleBvandVhonuQCrkjnE0S7W-OdfH6NrXnbOTetGYb0zGEsac~qQAobQ8znNwDJmzdLeticYIy6WdfVoPRl7~0Gzs~tH3Bi7KyjXyBHPaLF8e6R~p2d6tvZxhGATzwKBjRXblgV~FGOfwyKCwmdY3O~ioiVVJxu3CMS9DI1bJAzv-eCdbSfA3cVDqTe2pBmaSr30Dztg8wfB3aZrXPDJkIjgRsVxAClzEREhWrW57RA3mUSLsynwa2IkWnt1WwCuR2l~-4YJgy0rmtC-vGR31o~ssnMJqUZQ__"
                        width={'387px'}
                    />
                    <Flex
                        flexDirection={'column'}
                        gap={'5px'}
                        backgroundColor={'#ffffffbe'}
                        borderRadius={'16px'}
                        width={'500px'}
                        padding={'20px'}
                    >
                        <Text
                            fontSize={'20px'}
                            fontWeight={600}
                        >
                            Your account
                        </Text>
                        <Text>
                            Wallet: 0x8e4d5a6c7a4d5e4d5a6c7a4d
                        </Text>
                        <Text>
                            Balance: 10 EURe
                        </Text>
                    </Flex>
                </Flex>
            </Flex>

        </>
    )
}

export default Balance
