import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dbDir = path.join(root, 'src', 'database')
const outDir = path.resolve(root, '..', 'SOICT_DoAn_LeThiQuynh', 'Hinhve')

const jobs = [
  {
    input: path.join(dbDir, 'db.dbml'),
    output: path.join(outDir, 'Web bán hàng.png'),
    width: 4200,
  },
]

function dbmlToPng({ input, output, width }) {
  const svgPath = `${output}.svg`
  execSync(
    `npx --yes @softwaretechnik/dbml-renderer -i "${input}" -f svg -o "${svgPath}"`,
    { stdio: 'inherit', cwd: root },
  )

  const svg = fs.readFileSync(svgPath)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'white',
  })
  const png = resvg.render().asPng()
  fs.writeFileSync(output, png)
  fs.unlinkSync(svgPath)
  console.log(`Saved ${output} (${width}px wide)`)
}

fs.mkdirSync(outDir, { recursive: true })
for (const job of jobs) {
  dbmlToPng(job)
}

// ERD dạng thực thể (Chen) — không dùng dbml-renderer
execSync('node scripts/export-entity-erd.mjs', { stdio: 'inherit', cwd: root })

const legacy = path.join(outDir, 'Web bán hàng .png')
if (fs.existsSync(legacy)) {
  fs.unlinkSync(legacy)
}
