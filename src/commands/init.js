import * as log from '../util/log'
import Translation from '../Translation'
import { fetchSegmentsFromLanguageFiles } from '../util/languages'
import { fetchSegmentsFromVueFiles } from '../util/source'
import { join } from 'path'
import { writeFileSync } from 'fs'

export default function (config) {
    log.info('Initializing project over Translation.io ...')

    if (config === null) {
        log.error('The configuration file is missing. Please create a `translation.json` configuration file at the root of your project.')

        return
    }

    const segmentsFromVueFiles = fetchSegmentsFromVueFiles(config)
    const segmentsFromLanguageFiles = fetchSegmentsFromLanguageFiles(config)
    const sourceTranslations = segmentsFromLanguageFiles[config.source_locale] || []

    const segments = {}

    config.target_locales.forEach((locale) => {
        segments[locale] = []
    })

    segmentsFromVueFiles
        .forEach((segment) => {
            const sourceTranslation = sourceTranslations.find(source => source.key === segment.path)

            config.target_locales.forEach((locale) => {
                if (config.translations_type === 'key') {
                    segments[locale].push({
                        type: 'key',
                        key: segment.path,
                        source: sourceTranslation ? sourceTranslation.target : '',
                        target: ''
                    })
                } else {
                    segments[locale].push({
                        type: 'source',
                        source: segment.path,
                        target: ''
                    })
                }
            })
        })

    Object.keys(segments).forEach((locale) => {
        const languageTranslations = segmentsFromLanguageFiles[locale]

        if (languageTranslations) {
            languageTranslations.forEach((translation) => {
                if (! translation.target) {
                    return
                }

                if (config.translations_type === 'key') {
                    const segmentIndex = segments[locale].findIndex(segment => segment.key === translation.key)
                    if (segmentIndex >= 0) {
                        segments[locale][segmentIndex].target = translation.target
                    }
                } else {
                    const segmentIndex = segments[locale].findIndex(segment => segment.source === translation.source)
                    if (segmentIndex >= 0) {
                        segments[locale][segmentIndex].target = translation.target
                    }
                }
            })
        }
    })

    const translation = new Translation(config)

    translation
        .init(segments)
        .then((data) => {
            log.success(`Project \`${data.project.name}\` initialized with success.`)

            Object.keys(data.segments)
                .forEach((locale) => {
                    const translations = {}

                    data.segments[locale].forEach((segment) => {
                        if (config.translations_type === 'key') {
                            translations[segment.key] = segment.target
                        } else {
                            translations[segment.source] = segment.target
                        }
                    })

                    writeFileSync(join(process.cwd(), config.translations_directory, `${locale}.json`), JSON.stringify(translations, null, 4), { encoding: 'utf8' })
                })
        }, (error) => {
            //
        })
}