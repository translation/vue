import * as log from '../util/log'
import Translation from '../Translation'
import { fetchSegmentsFromLanguageFiles } from '../util/languages'
import { fetchSegmentsFromVueFiles } from '../util/source'
import { join } from 'path'
import { writeFileSync } from 'fs'

export default function (config) {
    log.info('Synchronizing project over Translation.io ...')

    const segmentsFromVueFiles = fetchSegmentsFromVueFiles(config)
    const segmentsFromLanguageFiles = fetchSegmentsFromLanguageFiles(config)

    if (segmentsFromVueFiles.length === 0) {
        log.error('No translations found in your vue files. Please check your `source_path` config and make sure you have localized strings in your code.')

        return
    }

    if (Object.keys(segmentsFromLanguageFiles).length === 0) {
        log.error('No language files where found. Please check your `translations_directory` config.')

        return
    }

    const sourceTranslations = segmentsFromLanguageFiles[config.source_locale] || []

    const sourceSegments = segmentsFromVueFiles
        .map((segment) => {
            if (config.translations_type === 'key') {
                const sourceTranslation = sourceTranslations.find(source => source.key === segment.path)

                if (! sourceTranslation) {
                    // Add missing keys to the source translations
                    sourceTranslations.push({
                        type: 'key',
                        key: segment.path,
                        source: (config.default_empty ? '' : segment.path)
                    })
                }

                return {
                    type: 'key',
                    key: segment.path,
                    source: sourceTranslation ? sourceTranslation.target : (config.default_empty ? '' : segment.path)
                }
            } else {
                return {
                    type: 'source',
                    source: segment.path
                }
            }
        })

    if (config.translations_type === 'key') {
        // Remove unused keys from source translations
        sourceTranslations.forEach((translation, index) => {
            if (sourceSegments.findIndex(segment => segment.key === translation.key) < 0) {
                log.warn('Remove unused translation', translation.key)
                sourceTranslations.splice(index, 1)
            }
        })

        // Update source translations file
        const updatedSourceTranslations = {}

        sourceTranslations.forEach((segment) => {
            updatedSourceTranslations[segment.key] = segment.target
        })

        writeFileSync(join(process.cwd(), config.translations_directory, `${config.source_locale}.json`), JSON.stringify(updatedSourceTranslations, null, 4), { encoding: 'utf8' })
    }

    const api = new Translation(config)

    if (config.translations_type === 'key') {
        api
            .pull()
            .then((data) => {
                if (data.source_edits.length === 0) {
                    log.info(`No source edits for \`${data.project.name}\``)

                    return
                }

                // Update source edits
                data.source_edits.forEach((edit) => {
                    const translationIndex = sourceTranslations.findIndex(translation => {
                        return translation.key === edit.key
                    })

                    if (translationIndex >= 0) {
                        log.info(`Replacing old traduction \`${edit.new_source}\` by \`${edit.old_source}\` for key \`${edit.key}\`.`)

                        sourceTranslations[translationIndex].target = edit.new_source
                    }
                })

                // Update source translations in file
                const translations = {}

                sourceTranslations.forEach((segment) => {
                    translations[segment.key] = segment.target
                })

                writeFileSync(join(process.cwd(), config.translations_directory, `${config.source_locale}.json`), JSON.stringify(translations, null, 4), { encoding: 'utf8' })

            })
    }

    api.sync(sourceSegments, config.readonly, config.purge)
        .then((data) => {
            Object.keys(data.segments)
                .forEach((locale) => {
                    const translations = {}

                    data.segments[locale].forEach((segment) => {
                        if (segment.target) { // Only add existing translations to allow fallback
                            if (config.translations_type === 'key') {
                                translations[segment.key] = segment.target
                            } else {
                                translations[segment.source] = segment.target
                            }
                        }
                    })

                    writeFileSync(join(process.cwd(), config.translations_directory, `${locale}.json`), JSON.stringify(translations, null, 4), { encoding: 'utf8' })
                })

            if (config.purge) {
                // Perform purge
                log.success(`\`${data.unused_segment_ids.length}\` segments removed.`)
            }

            log.success(`Project \`${data.project.name}\` synchronized with success.`)

        }, (error) => {
            log.error('An error occured..')
            log.error(error.message)
        })
}