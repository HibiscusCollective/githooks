import { describe, expect, test } from 'vitest'
import { err, ok, StructuredError, type Result } from './result'

class TestError extends StructuredError {
	readonly testField: string

	constructor({ testField }: { testField: string }) {
		super('test message')

		this.testField = testField
	}
}

describe.concurrent.shuffle('using result object', () => {
	const scenarios = {
		'given a success result': () => {
			const result: Result<string> = ok('success')

			describe.concurrent('when the script invokes the ok getter', () => {
				const got = result.ok()

				test.concurrent('then it returns the value', () => {
					expect(got).toStrictEqual('success')
				})
			})
			describe.concurrent('when the script invokes the error getter', () => {
				const got = result.err()

				test.concurrent('then it returns undefined', () => {
					expect(got).toBeUndefined()
				})
			})
		},
		'given an error result': () => {
			const result = err(new TestError({ testField: 'value' }))

			describe.concurrent('when the script invokes the ok getter', () => {
				const got = result.ok()

				test.concurrent('then it returns undefined', () => {
					expect(got).toBeUndefined()
				})
			})
			describe.concurrent('when the script invokes the error getter', () => {
				const got = result.err()

				test.concurrent('then it returns the error', () => {
					expect(got).toStrictEqual(new TestError({ testField: 'value' }))
				})
				test.concurrent('and the field is directly accessible', () => {
					expect(got?.testField).toStrictEqual('value')
				})
			})
		},
	}

	Object.entries(scenarios).forEach(([name, fn]) => describe.concurrent.shuffle(name, fn))
})
