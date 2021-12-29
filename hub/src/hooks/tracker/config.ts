import {EventEmitter} from 'events'
import { ClientSideSocket } from '../../lib/SocketEvents'
import AtemConfiguration from '../../mixer/atem/AtemConfiguration'
import MockConfiguration from '../../mixer/mock/MockConfiguration'
import ObsConfiguration from '../../mixer/obs/ObsConfiguration'
import RolandV8HDConfiguration from '../../mixer/rolandV8HD/RolandV8HDConfiguration'
import RolandV60HDConfiguration from '../../mixer/rolandV60HD/RolandV60HDConfiguration'
import RolandVR50HDConfiguration from '../../mixer/rolandVR50HD/RolandVR50HDConfiguration'
import VmixConfiguration from '../../mixer/vmix/VmixConfiguration'
import { DefaultTallyConfiguration } from '../../tally/TallyConfiguration'

class ConfigTracker extends EventEmitter{
    allowedMixers?: string[]
    mixerName?: string
    // @TODO: this should be more easily extensible
    atemConfiguration?: AtemConfiguration
    // @TODO: not needed when not in dev
    mockConfiguration?: MockConfiguration
    obsConfiguration?: ObsConfiguration
    rolandV8HDConfiguration?: RolandV8HDConfiguration
    rolandV60HDConfiguration?: RolandV60HDConfiguration
    rolandVR50HDConfiguration?: RolandVR50HDConfiguration
    vmixConfiguration?: VmixConfiguration
    defaultTallyConfiguration?: DefaultTallyConfiguration

    constructor(socket: ClientSideSocket) {
        super()

        socket.on('config.state.mixer', ({mixerName, allowedMixers}) => {
            this.mixerName = mixerName
            this.allowedMixers = allowedMixers
            this.emit('mixer', this.mixerName)
            this.emit('allowedMixers', this.allowedMixers)
        })
        socket.on('config.state.atem', (atem) => {
            this.atemConfiguration = new AtemConfiguration()
            this.atemConfiguration.fromJson(atem)
            this.emit('atem', this.atemConfiguration)
        })
        socket.on('config.state.mock', (mock) => {
            this.mockConfiguration = new MockConfiguration()
            this.mockConfiguration.fromJson(mock)
            this.emit('mock', this.mockConfiguration)
        })
        socket.on('config.state.obs', (obs) => {
            this.obsConfiguration = new ObsConfiguration()
            this.obsConfiguration.fromJson(obs)
            this.emit('obs', this.obsConfiguration)
        })
        socket.on('config.state.rolandV8HD', (rolandV8HD) => {
            this.rolandV8HDConfiguration = new RolandV8HDConfiguration()
            this.rolandV8HDConfiguration.fromJson(rolandV8HD)
            this.emit('rolandV8HD', this.rolandV8HDConfiguration)
        })
        socket.on('config.state.rolandV60HD', (rolandV60HD) => {
            this.rolandV60HDConfiguration = new RolandV60HDConfiguration()
            this.rolandV60HDConfiguration.fromJson(rolandV60HD)
            this.emit('rolandV60HD', this.rolandV60HDConfiguration)
        })
        socket.on('config.state.rolandVR50HD', (rolandVR50HD) => {
            this.rolandVR50HDConfiguration = new RolandVR50HDConfiguration()
            this.rolandVR50HDConfiguration.fromJson(rolandVR50HD)
            this.emit('rolandVR50HD', this.rolandVR50HDConfiguration)
        })
        socket.on('config.state.vmix', (vmix) => {
            this.vmixConfiguration = new VmixConfiguration()
            this.vmixConfiguration.fromJson(vmix)
            this.emit('vmix', this.vmixConfiguration)
        })
        socket.on('config.state.tallyconfig', (conf) => {
            this.defaultTallyConfiguration = new DefaultTallyConfiguration()
            this.defaultTallyConfiguration.fromJson(conf)
            this.emit('tally', this.defaultTallyConfiguration)
        })
        socket.emit('events.config.subscribe')
    }
}

export default ConfigTracker
