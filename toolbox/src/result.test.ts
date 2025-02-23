import { describe, expect, it } from 'bun:test'
import { err, ok, type StructuredError, type Result } from './result.ts'

class TestError implements StructuredError {
	readonly name = 'TestError'
	readonly message = 'test message'
	readonly testField: string

	constructor({ testField }: { testField: string }) {
		this.testField = testField
	}

	display(): string {
		return this.testField
	}

	json(): string {
		return JSON.stringify({
			testField: this.testField,
		})
	}
}

describe('given a success result', () => {
	const result: Result<string> = ok('success')

	describe('when the script invokes the ok getter', () => {
		const got = result.ok()

		it('it should return the value', () => {
			expect(got).toStrictEqual('success')
		})
	})
	describe('when the script invokes the error getter', () => {
		const got = result.err()

		it('it should return undefined', () => {
			expect(got).toBeUndefined()
		})
	})
})

describe('given an error result', () => {
	const result = err(new TestError({ testField: 'value' }))

	describe('when the script invokes the ok getter', () => {
		const got = result.ok()

		it('it should return undefined', () => {
			expect(got).toBeUndefined()
		})
	})
	describe('when the script invokes the error getter', () => {
		const got = result.err()

		it('it should return the error', () => {
			expect(got).toStrictEqual(new TestError({ testField: 'value' }))
		})
		it('and the field is directly accessible', () => {
			expect(got?.testField).toStrictEqual('value')
		})
	})
})
