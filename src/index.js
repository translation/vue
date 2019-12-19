#!/usr/bin/env node
import program from 'commander'
import pkg from '../package.json'
import resolveConfig from './util/resolveConfig'
import * as log from './util/log'

import sync from './commands/sync'
import init from './commands/init'

program
    .version(pkg.version, '-v, --version')
    .option('-c, --config <path>', 'Set the config path. Defaults to ./translation.conf', './translation.conf')

program.command('init')
    .description('Init the translation.io project by pushing all source and translated text into the backend. This should only be executed one time per project.')
    .action((options) => {
        const config = resolveConfig(options, program.config)
        if (config === null) {
            log.error('The configuration file is missing. Please create a `translation.json` configuration file at the root of your project.')

            return
        }

        init(config)
    })

program.command('sync')
    .description('Sync translations')
    .option('-p, --purge', 'Purge when syncing keys', false)
    .option('-r, --readonly', 'Only pull translations (do not push local translations)', false)
    .action((options) => {
        const config = resolveConfig(options, program.config)

        if (config === null) {
            log.error('The configuration file is missing. Please create a `translation.json` configuration file at the root of your project.')

            return
        }

        sync(config)
    })

program.parse(process.argv)

if (process.argv.length === 2) {
    program.help()
}