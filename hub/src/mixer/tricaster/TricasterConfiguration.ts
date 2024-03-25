import ipAddress, {IpAddress} from '../../domain/IpAddress'
import {Configuration} from '../interfaces'

export type TricasterConfigurationSaveType = {
    ip: string
}

class TricasterConfiguration extends Configuration {
    ip: IpAddress

    constructor() {
        super()
        this.ip = TricasterConfiguration.defaultIp
    }

    fromJson(data: TricasterConfigurationSaveType): void {
        this.loadIpAddress("ip", this.setIp.bind(this), data)
    }
    toJson(): TricasterConfigurationSaveType {
        return {
            ip: this.ip.toString(),
        }
    }
    clone(): TricasterConfiguration {
        const clone = new TricasterConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

    setIp(ip: IpAddress | string | null) {
        if (typeof ip === "string") {
            ip = ipAddress(ip)
        } else if (ip === null) {
            ip = TricasterConfiguration.defaultIp
        }
        this.ip = ip
        
        return this
    }
    getIp() {
        return this.ip
    }

    private static readonly defaultIp = ipAddress("127.0.0.1")
}

export default TricasterConfiguration