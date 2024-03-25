import { MixerCommunicator } from '../../lib/MixerCommunicator'
import {Connector} from '../interfaces'
import TC from "@bitfocusas/tricaster"
import Channel from '../../domain/Channel'
import TricasterConfiguration from './TricasterConfiguration'

class TricasterConnector implements Connector {
    configuration: TricasterConfiguration
    communicator: MixerCommunicator
    isTricasterConnected: boolean
    myTricaster: TC | null
    
    constructor(configuration: TricasterConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
        this.isTricasterConnected = false
    }
    private onStateChange() {
        if (this.myTricaster) {
            const programs = this.myTricaster.listVisibleInputs("program").sort().map(i => i.toString())
            const previews = this.myTricaster.listVisibleInputs("preview").sort().map(i => i.toString())
            this.communicator.notifyProgramPreviewChanged(programs, previews)

            // const channels = Object.values(this.myTricaster.state?.inputs || {}).reduce((channels: Channel[], input) => {
            //     if (input) {
            //         channels.push(new Channel(input.inputId.toString(), input.longName))
            //     }
            //     return channels
            // }, [])
            // this.communicator.notifyChannels(channels)
        }
    }
    connect() {
        this.myTricaster = new TC(this.configuration.getIp().toString())
        this.myTricaster.on('info', console.log)
        this.myTricaster.on('error', console.error)

        console.log(`Connecting to Tricaster at ${this.configuration.getIp().toString()}`)

        this.myTricaster.on('connected', () => {
            this.isTricasterConnected = true
            console.log("Connected to Tricaster")
            this.communicator.notifyMixerIsConnected()
            this.onStateChange()
        })

        this.myTricaster.on('variable', (key, obj) => {
            console.log("["+key+"]:",obj)
          });
        
        this.myTricaster.on('close', () => {
            console.log(
                this.isTricasterConnected ?
                "Lost connection to Tricaster" :
                "Could not connect to Tricaster. This could mean that the maximum number of devices are already connected to Tricaster."
            )
            this.isTricasterConnected = false
            this.communicator.notifyMixerIsDisconnected()
        })

        this.myTricaster.on('stateChanged', this.onStateChange.bind(this))
    }
    disconnect() {
        console.log("Cutting connection to Tricaster mixer.")
        this.isTricasterConnected = false
        this.communicator.notifyMixerIsDisconnected()
        if(this.myTricaster) {
            this.myTricaster.removeAllListeners("info")
            this.myTricaster.removeAllListeners("error")
            this.myTricaster.removeAllListeners("connected")
            this.myTricaster.removeAllListeners("disconnected")
            this.myTricaster.removeAllListeners("stateChanged")
            this.myTricaster.close()
        }
    }
    isConnected() {
        // @TODO: is there an API function so that we do not need to track state?
        return this.isTricasterConnected
    }

    static readonly ID: "tricaster" = "tricaster"
}

export default TricasterConnector
