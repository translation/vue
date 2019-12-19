# Translation.io client for Vue.js

This package provides a CLI to manage your [Vue I18n](https://github.com/kazupon/vue-i18n) project synchronized with Translation.io.

Currently it only supports the usage of the `$t` and `$tc` methods inside your .vue & .js files.

## Installation

### Globally (recommanded)

You can install it globally by running this command

```bash
npm install @translation/vue -g
```

This will give you access to the `translation-vue` script.

### Locally

If you install it locally on a specific project, you will have to use the path instead: `node_modules/@translation/vue/bin/index.js` instead.

```bash
npm install @translation/vue --save
```

## Configuration

Go to your Translation.io account page and create a new project.
Once the project is created, you'll see the configuration file. It should look like this : 

```js
{
    "key": "YOUR_PROJECT_API_KEY",
    "source_locale": "en",
    "target_locales": ["fr-BE", "nl-BE"],
    "source_path": "/src/**/*.?(js|vue)",
    "translations_directory": "/src/locales/",
    "translations_type": "key",
    "default_empty": false
}

````

- `key`: the API key for your Translation.io project
- `source_locale`: Source locale
- `target_locales`: Target locales
- `source_path`: Where is located your source files
- `translations_directory`: Where are located your translations files
- `translation_type`: Either `key` or `source`
- `default_empty`: Only for the key type. If true, it'll push the key as the source translation.

## Usage

### Init

Itialize your project and push existing translations to Translation.io with:

```bash
translation-vue init
```

### Sync

Send new translatable keys/strings and get new translations from Translation.io.


```bash
translation-vue sync
```

### Sync & Purge

If you need to remove unused keys/strings from Translation.io, using the current application as reference.

```bash
translation-vue sync --purge
```

As the name says, this operation will also perform a sync at the same time.

Warning: all keys that are not present in the current application will be **permanently deleted from Translation.io**.

