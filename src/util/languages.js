import { sync } from 'glob'
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { dot } from 'dot-object'

import * as log from './log'

export const fetchSegmentsFromLanguageFiles = config => {
    if (!existsSync(config.translations_directory)) {
        mkdirSync(config.translations_directory)
    }

    const languageFilesPath = resolve(
        process.cwd(),
        config.translations_directory
    )

    const languageFiles = readdirSync(languageFilesPath).map(file => {
        const languagePath = resolve(
            process.cwd(),
            config.translations_directory,
            file
        )

        const languageModule = require(languagePath)
        const { default: defaultImport } = languageModule

        const languageObject = defaultImport ? defaultImport : languageModule

        const fileName = file.replace(process.cwd(), '')

        return {
            fileName,
            path: file,
            content: languageObject,
        }
    })

    if (languageFiles.length === 0) {
        return []
    }

    return languageFiles.reduce((accumulator, file) => {
        const language = file.fileName.substring(
            file.fileName.lastIndexOf('/') + 1,
            file.fileName.lastIndexOf('.')
        )

        const flattenedObject = dot(file.content)
        const segmentsInFile = Object.keys(flattenedObject).map(
            (key, index) => {
                if (config.translations_type === 'key') {
                    return {
                        key,
                        target: flattenedObject[key],
                    }
                } else {
                    return {
                        source: key,
                        target: flattenedObject[key],
                    }
                }
            }
        )

        accumulator[language] = segmentsInFile

        return accumulator
    }, {})
}
