export class StructuredError extends Error {
	readonly message: string

	constructor(message: string) {
		super(message)

		this.message = message
	}
}

export function ok<T, E extends StructuredError = StructuredError>(value: T): Result<T, E> {
	return new Result<T, E>(value, undefined)
}

export function err<T, E extends StructuredError = StructuredError>(error: E): Result<T, E> {
	return new Result<T, E>(undefined, error)
}

export class Result<T, E extends StructuredError = StructuredError> {
	readonly value: T | undefined
	readonly error: E | undefined

	constructor(value: T | undefined, error: E | undefined) {
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
