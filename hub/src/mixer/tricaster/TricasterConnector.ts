import { MixerCommunicator } from '../../lib/MixerCommunicator'
import {Connector} from '../interfaces'
import Channel from '../../domain/Channel'
import TricasterConfiguration from './TricasterConfiguration'
const TC = require("@bitfocusas/tricaster");

class TricasterConnector implements Connector {
    configuration: TricasterConfiguration
    communicator: MixerCommunicator
    isTricasterConnected: boolean
    myTricaster: any
    
    constructor(configuration: TricasterConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
        this.isTricasterConnected = false
    }
    private onStateChange() {
        if (this.myTricaster) {
            let channels: Channel[] = []

            const channelKeys = Object.keys(this.myTricaster.shortcut_states).filter(
                k => k.match(/^input\d+_long_name/)
            )
            
            channelKeys.forEach(channel => {
                var id = this.myTricaster.shortcut_states[channel].value.split(" ")[0]
                var name = this.myTricaster.shortcut_states[channel].value.split(" ")[1]

                channels.push(new Channel(id, name))
            })
            this.communicator.notifyChannels(channels)
        }
    }
    connect() {
        this.myTricaster = new TC(this.configuration.getIp().toString())

        this.myTricaster.on('info', console.log)
        this.myTricaster.on('error', console.error)

        console.log(`Connecting to Tricaster at ${this.configuration.getIp().toString()}`)
        this.myTricaster.connect();

        this.myTricaster.on('ready', () => {
            this.isTricasterConnected = true
            console.log("Connected to Tricaster")
            this.communicator.notifyMixerIsConnected()
            this.onStateChange()
        })

        this.myTricaster.on('variable', (key, obj) => {
        
            if (key === 'preview_tally') {
                console.log("PREVIEW TALLY:", obj.value)
                this.communicator.notifyPreviewChanged([obj.value.split("INPUT")[1]])
            }
        
            if (key === 'program_tally') {
                console.log("PROGRAM TALLY:", obj.value)
                this.communicator.notifyProgramChanged([obj.value.split("INPUT")[1]])
            }

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
