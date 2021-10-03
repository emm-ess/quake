import{plot, red} from 'asciichart'
import axios from 'axios'
import Table from 'cli-table3'
import type {MessageEvent} from 'sockjs-client'
import SockJS from 'sockjs-client'
import getTerminalSize from 'term-size'
import WebSocket from 'ws'

// eslint-disable-next-line import/no-unresolved,node/no-missing-import
import {Quake} from './quake.js'
import {QuakeData, QuakeProperties} from './types'
import type {QuakeMessage} from './types'
// eslint-disable-next-line import/no-unresolved,node/no-missing-import
import {ensureArrayLength, scale} from './util.js'

// eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
Object.assign(global, {WebSocket})

// useful links:
// . https://www.seismicportal.eu/fdsnws/event/1
// . https://www.seismicportal.eu/fdsn-wsevent.html
// . https://github.com/EMSC-CSEM/webservices101/blob/master/emsc_services/emsc_services.md
const DELAY_MINUTES = 60
const DELAY_MS = DELAY_MINUTES * 60 * 1000

const sock = new SockJS('https://www.seismicportal.eu/standing_order')
sock.addEventListener('open', () => console.log('connected'))
sock.addEventListener('close', () => console.log('disconnected'))
sock.addEventListener('message', messageHandler)

const quakes: Quake[] = []
const colWidths = [10, 10, 7, 5, 9]
const quakeTable = new Table({
    head: ['start', 'end', 'depth', 'mag', 'current'],
    colWidths,
})
const tableWidth = colWidths.length + 1 + colWidths.reduce((sum, current) => sum + current, 0)
const emptyTableString = ' '.repeat(tableWidth)
const strengthHistory: number[] = []
const graphMinBar: number[] = []
const graphMaxBar: number[] = []

function sortQuakes(): void {
    quakes.sort((a, b) => a.start.valueOf() - b.start.valueOf())
}

function messageHandler(event: MessageEvent): void {
    const {properties} = (JSON.parse(event.data) as QuakeMessage).data
    addQuake(properties)
    sortQuakes()
}

async function queryAlreadyKnownQuakes(): Promise<void> {
    const delayedNow = new Date(Date.now() - DELAY_MS)
    const params = {
        format: 'json',
        starttime: delayedNow.toISOString()
    }
    const {data} = await axios.get<{features: QuakeData[]}>('https://www.seismicportal.eu/fdsnws/event/1/query', {params})
    data.features.forEach(({properties}) => {
        addQuake(properties)
    })
    sortQuakes()
}

function addQuake(properties: QuakeProperties): void {
    const {unid} = properties
    const oldQuake = quakes.find((quake) => quake.id === unid)
    if (oldQuake) {
        oldQuake.update(properties)
    }
    else {
        quakes.push(new Quake(properties))
    }
}

function sumQuakes(now:  number): number {
    quakeTable.splice(0)
    let summedStrength = 0
    for (const quake of quakes) {
        const strength = quake.getCurrentStrength(now)
        if (strength === undefined) {
            const index = quakes.indexOf(quake)
            // eslint-disable-next-line sonarjs/no-ignored-return
            quakes.slice(index, 1)
            continue
        }
        const {startString, endString, depth, magnitude} = quake
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        quakeTable.push([startString, endString, depth, magnitude, strength])
        summedStrength += strength
    }
    return summedStrength
}

type TerminalSize = ReturnType<typeof getTerminalSize>
function renderStrengthHistory({rows, columns}: TerminalSize, widthOffset: number): string {
    const width = columns - widthOffset - 15
    ensureArrayLength(strengthHistory, width, 0)
    ensureArrayLength(graphMinBar, width, 0)
    ensureArrayLength(graphMaxBar, width, 127)
    return plot([graphMinBar, graphMaxBar, strengthHistory], {height: rows - 4, colors: [undefined, undefined, red]})
}

function render(now: number, summedStrength: number): void {
    const terminalSize = getTerminalSize()
    const tableStrings = quakeTable.toString().split('\n')
    const graphStrings = renderStrengthHistory(terminalSize, tableWidth).split('\n')
    // const lineCount = Math.max(Math.min(tableStrings.length, graphStrings.length), terminalSize.rows - 4)
    const combined = graphStrings.map((graphLine, index) => {
        const tableLine = tableStrings[index] || emptyTableString
        return tableLine + graphLine
    }).join('\n')
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    console.clear()
    console.log((new Date(now)).toLocaleString(), `Delay: ${DELAY_MINUTES} minutes`, `summed strength: ${summedStrength}`)
    console.log()
    console.log(combined)
}

function showActiveQuakes(): void {
    const now = Date.now() - DELAY_MS
    const summedStrength = sumQuakes(now)
    strengthHistory.push(summedStrength)
    render(now, summedStrength)
    setTimeout(showActiveQuakes, 1000)
}
await queryAlreadyKnownQuakes()
setTimeout(showActiveQuakes, 1000)
