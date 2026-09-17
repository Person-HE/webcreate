import fs from 'fs'

const s = fs.readFileSync('data/templates.ts', 'utf8')
// top-level templates have id + name + category + description
const staticCount = [...s.matchAll(/id:\s*['"][^'"]+['"],\s*\n\s*name:/g)].length

const a = fs.readFileSync('data/animationTemplates.ts', 'utf8')
// animation templates export objects with fps + generateFrames
const animCount = [...a.matchAll(/fps:\s*\d+/g)].length

console.log(JSON.stringify({ staticCount, animCount }, null, 2))
