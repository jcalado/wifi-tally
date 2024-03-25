import React, { useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import { useTricasterConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'

type TricasterSettingsProps = {
    id: "tricaster", // @TODO: use the constant. But for now it makes the frontend build crash with ("Module not found: Can't resolve 'child_process'" - and no stack trace). WTF?
    label: string,
}

function TricasterSettings(props: TricasterSettingsProps) {
    const configuration = useTricasterConfiguration()
    const [ip, setIp] = useState<string|null>(null)
    const [ipValid, setIpValid] = useState(true)

    const isLoading = !configuration
    const isValid = ipValid

    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== "tricaster") {
            console.warn(`Changing id prop of TricasterSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)


            socket.emit('config.change.tricaster', config.toJson(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="Tricaster Configuration"
            testId="tricaster"
            description="Connects to any Tricaster device over network."
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
            {configuration && (<>
                <ValidatingInput label="Tricaster IP" testId="tricaster-ip" object={configuration} propertyName="ip" onValid={(newIp) => { setIp(newIp); setIpValid(true) }} onInvalid={() => setIpValid(false)} />
            </>)}
            
        </MixerSettingsWrapper>
    )
}

TricasterSettings.defaultProps = {
    id: "tricaster",
    label: "Tricaster by Newtek",
}

export default TricasterSettings
