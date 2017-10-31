'use strict'

const path = require('path')
const { loadDir } = require('./lib/load')
const { getOverallCoverage } = require('./lib/coverage')

const formatCount = (status, count) => {
  const statusStr = status.padEnd(12)
  const countStr = `${count}`.padStart(7)
  return `${statusStr}|${countStr}`
}

const formatPercentage = number => {
  return `${(number * 10000 | 0) / 100}%`
}

async function main () {
  const dirPath = path.resolve(__dirname, '../coverage')
  const report = await loadDir(dirPath)

  const coverage = getOverallCoverage(report)
  const divider = '='.repeat(20)

  console.log('Overall Coverage')
  console.log(divider)

  let total = 0
  for (const [status, count] of coverage.entries()) {
    console.log(formatCount(status, count))
    total += count
  }

  console.log(divider)
  console.log(formatCount('total', total))

  const coveragePercentage = (total - coverage.get('todo')) / total

  console.log(formatCount('coverage',
    formatPercentage(coveragePercentage)))
}

main()
