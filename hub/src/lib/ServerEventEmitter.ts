import { EventEmitter } from "events";
import Channel from "../domain/Channel";
import Log from "../domain/Log";
import Tally from "../domain/Tally";
import AtemConfiguration from "../mixer/atem/AtemConfiguration";
import MockConfiguration from "../mixer/mock/MockConfiguration";
import NullConfiguration from "../mixer/null/NullConfiguration";
import ObsConfiguration from "../mixer/obs/ObsConfiguration";
import RolandV8HDConfiguration from "../mixer/rolandV8HD/RolandV8HDConfiguration"
import RolandV60HDConfiguration from "../mixer/rolandV60HD/RolandV60HDConfiguration"
import RolandVR50HDConfiguration from "../mixer/rolandVR50HD/RolandVR50HDConfiguration"
import TestConfiguration from "../mixer/test/TestConfiguration";
import VmixConfiguration from "../mixer/vmix/VmixConfiguration";
import { DefaultTallyConfiguration } from "../tally/TallyConfiguration";
import { AppConfiguration } from "./AppConfiguration";
import { ChannelList } from "./MixerCommunicator";

/* events that are send around on the server */

export interface EventHandlersDataMap {
    'config.changed': (configuration: AppConfiguration) => void
    'config.changed.atem': (atemConfiguration: AtemConfiguration) => void
    'config.changed.mock': (mockConfiguration: MockConfiguration) => void
    'config.changed.null': (nullConfiguration: NullConfiguration) => void
    'config.changed.obs': (obsConfiguration: ObsConfiguration) => void
    'config.changed.rolandV8HD': (rolandV8HDConfiguration: RolandV8HDConfiguration) => void
    'config.changed.rolandV60HD': (rolandV60HDConfiguration: RolandV60HDConfiguration) => void
    'config.changed.rolandVR50HD': (rolandVR50HDConfiguration: RolandVR50HDConfiguration) => void
    'config.changed.test': (testConfiguration: TestConfiguration) => void
    'config.changed.vmix': (vmixConfiguration: VmixConfiguration) => void
    'config.changed.tallyconfig': (tallyConfiguration: DefaultTallyConfiguration) => void
    'config.changed.channels': (channels: Channel[]) => void
    'config.changed.tallies': (tallies: Tally[]) => void
    'config.changed.mixer': (mixerName: string) => void
    'mixer.connected': () => void
    'mixer.disconnected': () => void
    'program.changed': (data: {programs: ChannelList, previews: ChannelList}) => void
    'tally.created': (t: Tally) => void
    'tally.changed': (t: Tally|undefined) => void
    'tally.removed': (t: Tally) => void
    'tally.logged': (data: {tally: Tally, log: Log}) => void
}

export type ServerEventName = keyof EventHandlersDataMap

interface ServerEventEmitter extends EventEmitter {
    emit<EventName extends keyof EventHandlersDataMap>(
        eventName: EventName,
        ...args: Parameters<EventHandlersDataMap[EventName]>
    ): boolean

    on<EventName extends keyof EventHandlersDataMap>(
        eventName: EventName,
        listener: EventHandlersDataMap[EventName]
    ): this
}

class ServerEventEmitter extends EventEmitter {}

export default ServerEventEmitter
