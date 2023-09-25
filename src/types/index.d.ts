// to make the file a module and avoid the TypeScript error
export {}

declare global {
    export interface Error {
        statusCode?: number
        timestamp?: number
        traceCode?: string
        details?: string
    }
}