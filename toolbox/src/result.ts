export class StructuredError extends Error {
	readonly message: string

	constructor(message: string) {
		super(message)

		this.message = message
	}
}

export function ok<E extends StructuredError = StructuredError>(): Result<void, E>
export function ok<T, E extends StructuredError = StructuredError>(value: T): Result<T, E>
export function ok<T, E extends StructuredError = StructuredError>(value?: T): Result<T | void, E> {
	return new Result<T | void, E>(value, undefined)
}

export function err<E extends StructuredError = StructuredError>(): Result<void, E>
export function err<T, E extends StructuredError = StructuredError>(error: E): Result<T, E>
export function err<T, E extends StructuredError = StructuredError>(error?: E): Result<T, E> {
	return new Result<T, E>(undefined, error)
}

export class Result<T = void, E extends StructuredError = StructuredError> {
	readonly value: T | undefined
	readonly error: E | undefined

	constructor(value?: T, error?: E) {
		this.value = value
		this.error = error
	}

	ok(): T | undefined {
		return this.value
	}

	err(): E | undefined {
		return this.error
	}
}
