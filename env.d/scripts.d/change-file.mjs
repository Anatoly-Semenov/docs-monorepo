import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
/*
--file
--param
 */

const sepStart = /\[{/g
const sepEnd = /}]/g
const regexp = /\[\{.+?}]/gs

const fileFlagIndex = process.argv.findIndex(_t => _t === '--file')
const file = fileFlagIndex === -1 ? undefined : process.argv[fileFlagIndex + 1]
const filePath = join(process.cwd(), file)

// const regexpFlagIndex = process.argv.findIndex(_t => _t === '--regexp')
// const regexp = regexpFlagIndex === -1 ? undefined : new RegExp(process.argv[regexpFlagIndex + 1], 'gs')

if (!file) {
  console.error('Пропущен параметр')
}

const paramFlagIndex = process.argv.findIndex(_t => _t === '--param')
const param = paramFlagIndex === -1 ? undefined :process.argv[paramFlagIndex + 1]

const _text = readFileSync(filePath).toString()

let text
if (!param || param === 'n') {
  text = _text.replace(regexp, "")
} else {
  text = _text.replace(sepStart, "").replace(sepEnd, "")
}

writeFileSync(filePath, text)