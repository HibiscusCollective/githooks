export interface StructuredError extends Error {
	readonly message: string

	display(): string
	json(): string
}

export function ok<E extends StructuredError = StructuredError>(): Result<void, E>
export function ok<T, E extends StructuredError = StructuredError>(value: T): Result<T, E>
export function ok<T, E extends StructuredError = StructuredError>(...values: T[]): Result<T | void, E> {
	return new Result<T | void, E>(values, undefined)
}

export function err<E extends StructuredError = StructuredError>(): Result<void, E>
export function err<T, E extends StructuredError = StructuredError>(error: E): Result<T, E>
export function err<T, E extends StructuredError = StructuredError>(...errors: E[]): Result<T, E> {
	return new Result<T, E>(undefined, errors)
}

export class Result<T = void, E extends StructuredError = StructuredError> {
	readonly values: T[] | undefined
	readonly errors: E[] | undefined

	constructor(values?: T[], errors?: E[]) {
		this.values = values
		this.errors = errors
	}

	ok(): T | undefined
	ok(): T[] | undefined
	ok(): T | T[] | undefined {
		if (this.values?.length === 1) {
			return this.values[0]
		}

		return this.values
	}

	err(): E | undefined
	err(): E[] | undefined
	err(): E | E[] | undefined {
		if (this.errors?.length === 1) {
			return this.errors[0]
		}

		return this.errors
	}
}
