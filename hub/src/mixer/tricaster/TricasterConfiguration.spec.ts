import TricasterConfiguration from './TricasterConfiguration'
import ipAddress from '../../domain/IpAddress'

function createDefaultTricasterConfiguration() {
    return new TricasterConfiguration()
}

describe('getIp/setIp', () => {
    it("has a default", () => {
        const conf = createDefaultTricasterConfiguration()
        expect(conf.getIp()).toBeTruthy()
    })
    it("allows to set an IpPort", () => {
        const conf = createDefaultTricasterConfiguration()
        conf.setIp(ipAddress("1.2.3.4"))
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to set a number", () => {
        const conf = createDefaultTricasterConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to restore the default", () => {
        const conf = createDefaultTricasterConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
        conf.setIp(null)
        expect(conf.getIp()).toBeTruthy()
    })
})

describe('fromJson/toJson', () => {
    it("does work", () => {
        const conf = createDefaultTricasterConfiguration()
        conf.setIp("1.2.3.4")

        const loadedConf = createDefaultTricasterConfiguration()
        loadedConf.fromJson(conf.toJson())
        
        expect(loadedConf.getIp().toString()).toEqual("1.2.3.4")
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultTricasterConfiguration()
        conf.setIp("1.2.3.4")

        const clone = conf.clone()
        conf.setIp("2.3.4.5") // it should be a new instance
        
        expect(clone.getIp().toString()).toEqual("1.2.3.4")
    })
})
