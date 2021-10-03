import type {QuakeProperties} from './types'
// eslint-disable-next-line import/no-unresolved,node/no-missing-import
import {calculateAttackTime, calculateDecayTime, envelope, getTimeString} from './util.js'

const STEEPNESS_ATTACK = 2
const STEEPNESS_DECAY = 1.5

export class Quake {
    id: string
    start: Date
    startString: string
    end: Date
    endString: string
    depth: number
    magnitude: number
    attackTime: number
    decayTime: number

    constructor(properties: Pick<QuakeProperties, 'unid' | 'time' | 'depth' | 'mag'>) {
        this.id = properties.unid
        this.update(properties)
    }

    update(properties: Pick<QuakeProperties, 'time' | 'depth' | 'mag'>): void {
        const {time, depth, mag} = properties
        this.start = new Date(time)
        this.depth = depth
        this.magnitude = mag

        this.attackTime = calculateAttackTime(depth)
        this.decayTime = calculateDecayTime(depth, mag)

        this.end = new Date(this.start.valueOf() + this.attackTime + this.decayTime)

        this.startString = getTimeString(this.start)
        this.endString = getTimeString(this.end)
    }

    getCurrentStrength(now: number): number | undefined {
        const {start, end, attackTime, decayTime, magnitude} = this
        const startTimeValue = start.valueOf()
        const endTimeValue = end.valueOf()
        if (now < startTimeValue) {
            return 0
        }
        else if (now > endTimeValue) {
             return undefined
         }
        else if (now < startTimeValue + attackTime) {
            const step = (now - startTimeValue) / attackTime
            return magnitude * envelope(step, STEEPNESS_ATTACK)
        }
        else {
            const step = (now - startTimeValue - attackTime) / decayTime
            return magnitude * (1 - envelope(step, STEEPNESS_DECAY))
        }
    }

    toString(): string {
        const {start, depth, magnitude} = this
        return `Quake: ${start.toISOString()}; ${depth} km; ${magnitude}`
    }
}
