/* eslint-disable camelcase */
export type QuakeMessage = {
    action: 'create' | 'update'
    data: QuakeData
}

export type QuakeData = {
    geometry: {
        type: 'Point'
        coordinates: unknown[]
    }
    type: 'Feature'
    id: string
    properties: QuakeProperties
}

export type QuakeProperties = {
    lastupdate: string
    magtype: 'm' | 'ml' | 'md' | 'mb'
    evtype: 'ke'
    lon: number
    auth: string
    lat: number
    depth: number
    unid: string
    mag: number
    time: string
    source_id: string
    source_catalog: string
    flynn_region: string
}
/* eslint-enable camelcase */
