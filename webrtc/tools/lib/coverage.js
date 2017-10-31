'use strict'

const addStatus = (statusTable, status) => {
  if (statusTable.has(status)) {
    statusTable.set(status, statusTable.get(status) + 1)
  } else {
    statusTable.set(status, 1)
  }
}

const calculateCoverage = (statusTable, steps) => {
  for (const step of steps) {
    const { status = 'unknown' } = step
    addStatus(statusTable, status)

    if (step.steps) {
      calculateCoverage(statusTable, step.steps)
    }
  }
}

const getOverallCoverage = entries => {
  // Create with essential keys to make them sorted first
  const statusTable = new Map([['todo', 0], ['tested', 0]])

  for (const entry of entries) {
    calculateCoverage(statusTable, entry.steps)
  }
  return statusTable
}

module.exports = {
  getOverallCoverage
}
