import { readFileSync } from 'fs'
import { join } from 'path'
import * as log from './log'

let config = null

export default (options, path = './translation.json') => {
    if (config) {
        return config
    }

    const configPath = join(process.cwd(), path)

    try {
        config = JSON.parse(readFileSync(configPath, 'utf8'))
    } catch (error) {
        log.error(error.message)
    }

    return config
}
