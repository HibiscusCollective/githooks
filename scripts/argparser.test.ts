import { describe, test, expect } from 'vitest'
import { parse } from './argparser'

describe.concurrent.shuffle('successfully parsing arguments, options and flags', () => {
	const scenarios = {
		'given no arguments': () => {
			describe.concurrent('when the script invokes the parser', () => {
				test.concurrent('then it returns empty Params', () => {
					expect(parse([])).toStrictEqual({ args: [], opts: {} })
				})
			})
		},
	}

	Object.entries(scenarios).forEach(([name, fn]) => describe.concurrent.shuffle(name, fn))
})
