import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import * as log from './util/log'

export default class Translation {
    constructor(config) {
        this.config = config

        this.setupApi()
    }

    setupApi() {
        this.api = axios.create({
            baseURL: 'https://translation.io/api/v1/',
            headers: {
                'x-api-key': this.config.key,
            },
        })

        this.api.interceptors.response.use(
            response => {
                return response
            },
            error => {
                if (error.response) {
                    const response = error.response
                    if (response.data && response.data.errors) {
                        response.data.errors.map(message => log.error(message))
                    } else {
                        log.error(
                            `${response.status}: ${response.statusText} (${error.config.url})`
                        )
                    }
                }

                throw error
            }
        )
    }

    getTimestamp() {
        let timestamp = 0
        try {
            timestamp = readFileSync(
                join(process.cwd(), 'translation.timestamp.js'),
                'utf8'
            )
        } catch (error) {}

        return timestamp
    }

    storeTimestamp(timestamp) {
        writeFileSync(
            join(process.cwd(), 'translation.timestamp.js'),
            timestamp,
            { encoding: 'utf8' }
        )
    }

    init(segments) {
        return new Promise((resolve, reject) => {
            this.api
                .post('segments/init', {
                    source_language: this.config.source_locale,
                    target_languages: this.config.target_locales,
                    segments,
                })
                .then(response => {
                    // console.log('response', response.data)
                    resolve(response.data)
                }, reject)
        })
    }

    pull() {
        const timestamp = this.getTimestamp()

        return new Promise((resolve, reject) => {
            this.api
                .get(`source_edits/pull`, {
                    params: { timestamp },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => {
                    log.success(
                        `Pulled source edits for \`${response.data.project.name}\`.`
                    )

                    this.storeTimestamp(response.data.timestamp)

                    resolve(response.data)
                }, reject)
        })
    }

    sync(segments, readonly = false, purge = false) {
        return new Promise((resolve, reject) => {
            this.api
                .post('segments/sync', {
                    source_language: this.config.source_locale,
                    target_languages: this.config.target_locales,
                    segments,
                    readonly,
                    purge,
                })
                .then(response => {
                    resolve(response.data)
                }, reject)
        })
    }
}
