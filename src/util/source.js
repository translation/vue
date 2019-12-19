import regeneratorRuntime from 'regenerator-runtime'
import { sync } from 'glob'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import * as log from './log'

export const fetchSegmentsFromVueFiles = (config) => {
    const vueFilesPath = resolve(process.cwd(), config.source_path)

    // Read all Vue files
    const vueFiles = sync(vueFilesPath)
        .map((file) => {
            const fileName = file.replace(process.cwd(), '')

            return {
                fileName,
                path: file,
                content: readFileSync(file, 'utf8')
            }
        })

    if (vueFiles.length === 0) {
        log.error('No vue files where found. Please check your `source_path` config.')

        return
    }

    // Extract segments from vue files
    const allMatches = vueFiles
        .reduce((accumulator, file) => {
            const methodMatches = extractMethodMatches(file)

            return [
              ...accumulator,
              ...methodMatches
            ]
        }, [])

    // Remove duplicates path
    return allMatches
        .filter((match, index) => {
            return allMatches.findIndex(m => m.path === match.path) === index
        })
}

function extractMethodMatches (file) {
    const methodRegExp = /(?:[$.]tc?)\(\s*?(\'|\"|\`)(.*?)(?<!\\)\1/g

    return [ ...getMatches(file, methodRegExp, 2) ]
}

function* getMatches (file, regExp, captureGroup = 1) {
  while (true) {
    const match = regExp.exec(file.content)

    if (match === null) {
        break
    }

    const line = (file.content.substring(0, match.index).match(/\n/g) || []).length + 1

    yield {
        path: match[captureGroup].replace(/\\/g, ''),
        line,
        file: file.fileName,
    };
  }
}
