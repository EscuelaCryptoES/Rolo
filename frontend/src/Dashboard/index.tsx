import { Avatar, Button, Flex, Input, Select, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import Onboarding from './Onboarding'
import Balance from './Balance'

const Dashboard = ({ smartAccount } : any) => {

    const [isOnboarding, setIsOnboarding] = useState(true)
    const [gnosisPay, setGnosisPay] = useState("0x0")

    console.log(smartAccount)

    const setParams = (data : any) => {
        setGnosisPay(data);
        setIsOnboarding(false);
    };

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
                height={'90%'}
                width={'80%'}
                backgroundColor={'rgba(88, 130, 193, 0.28)'}
                borderRadius={'40px'}
                padding={'90px'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'center'}
                gap={'20px'}
            >
                {isOnboarding ?
                    <Onboarding
                        smartAccount = {smartAccount}
                        setParams = {setParams}
                    />
                    :
                    <Balance 
                        gnosisPay = {gnosisPay}
                        address = {smartAccount.account.address}
                    />
                }

            </Flex>
        </Flex>
    )
}

export default Dashboard