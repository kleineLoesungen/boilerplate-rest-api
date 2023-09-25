import { Request, Response } from 'express'

/**
 * logs error with details (timestamp shared with response)
 */
export function errorLogger(error: Error, req: Request, res: Response, next: any) {
    error.timestamp = error.timestamp || new Date().getTime()
    error.traceCode = error.traceCode || 'unknown'
    error.statusCode = error.statusCode || 400
    error.details = JSON.stringify({
        body: getBodyWithoutPassword(),
        params: req.params,
        query: req.query
    })
    console.error( `${error.timestamp}#${error.traceCode} ${error.message} (response status: ${error.statusCode}) // details: ${error.details}`) 
    next(error) // calling next middleware

    function getBodyWithoutPassword(): object {
        const copyBody = JSON.parse(JSON.stringify(req.body))
        copyBody.password = "<replaced>"
        return copyBody
    }
}

/**
 * response error with few details (timestamp shared with response)
 */
export function errorResponder(error: Error, req: Request, res: Response, next: any) {
    res.header("Content-Type", 'application/json')  
    res.status(error.statusCode!).json({ message: error.message, timestamp: error.timestamp! })
}

/**
 * response for missing route 
 */
export function invalidPathHandler(req: Request, res: Response, next: any) {
    res.status(404)
    res.send('invalid path')
}