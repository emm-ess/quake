export function calculateAttackTime(depth: number): number {
    return 1.6 * depth * 1000
}

export function calculateDecayTime(depth: number, magnitude: number): number {
    return 0.9 * depth * 1.2 * magnitude * 1000
}

export function envelope(step: number, steepness: number): number {
    return Math.pow(step, steepness)
}

function padTime(part: number): string {
    return part.toString().padStart(2, '0')
}

export function getTimeString(date: Date): string {
    return [
        padTime(date.getHours()),
        padTime(date.getMinutes()),
        padTime(date.getSeconds()),
    ].join(':')
}

export function scale(value: number, inMax: number, outMax: number): number {
    return (value / inMax) * outMax
}

export function ensureArrayLength<T>(array: T[], desiredLength: number, fill: T): void {
    const currentLength = array.length
    if (currentLength > desiredLength) {
        const overflow = currentLength - desiredLength
        array.splice(0, overflow)
    }
    else if (currentLength < desiredLength) {
        const missingEntriesCount = desiredLength - currentLength
        const fillItems = Array.from({length: missingEntriesCount}).fill(fill) as T[]
        array.unshift(...fillItems)
    }
}
