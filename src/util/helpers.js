import { writeFileSync } from 'fs'
import { inspect } from 'util'
import { join } from 'path'

const writeLocaleFile = (locale, translations, config) => {
    let outputString, fileExtension = 'json'
    if (config.output === 'module') {
        outputString = 'module.exports = ' + inspect(translations, false, 2, false)
        fileExtension = 'js'
    } else {
        outputString = JSON.stringify(translations, null, 4)
    }

    writeFileSync(
        join(
            process.cwd(),
            config.translations_directory,
            `${locale}.${fileExtension}`
        ),
        outputString,
        { encoding: 'utf8' }
    )
}

export { writeLocaleFile }