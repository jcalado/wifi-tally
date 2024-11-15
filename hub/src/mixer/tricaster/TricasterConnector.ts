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
                k => k.match(/^input\d+_long_name/) || k.match(/^ddr\d+_long_name/) || k.match(/^v\d+_long_name/)
            )
            channelKeys.forEach(channel => {
                // Extract the base channel ID (input1, ddr1, v1, etc.)
                const baseId = channel.replace('_long_name', '').toUpperCase()                
                const name = this.myTricaster.shortcut_states[channel].value
                console.log(`Creating channel - baseId: ${baseId}, name: ${name}`)
                channels.push(new Channel(baseId, name))
            })
            console.log('Available channels:', channels)
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
                const value = obj.value
                this.communicator.notifyPreviewChanged([value])
            }
        
            if (key === 'program_tally') {
                const value = obj.value
                this.communicator.notifyProgramChanged([value])
            }


            // Match channel name changes, extract the channel ID and name to send to the communicator
            if (key.match(/^(input|ddr|v)(\d+)_long_name/)) {


                const matches = key.match(/^(input|ddr|v)(\d+)_long_name/);
                if (matches) {
                    const type = matches[1].toUpperCase();    // 'input', 'ddr' or 'v'
                    const number = matches[2];  // the channel number
                    const newName = obj.value;   // get new name value
                    
                    console.log(`Channel ${type}${number} name changed to: ${newName}`);
                    
                    // Get the current channels
                    let channels = this.communicator.configuration.getChannels()

                    // Find the channel by the number on the channels and update its name to the new name
                    const channelIndex = channels.findIndex(channel => channel.id === `${type}${number}`)
                    if (channelIndex !== -1) {
                        channels[channelIndex].name = newName
                        this.communicator.notifyChannels(channels)
                    }

                }
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
        console.log("Dropping connection to Tricaster mixer.")
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
