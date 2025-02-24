type Field = string | number | boolean | Jsonable | Array<Field>

export class Fields implements Jsonable {
	fields: Record<string, Field>

	constructor(fields: Record<string, Field>) {
		this.fields = fields
	}

	fromJson(json: string): this {
		this.fields = JSON.parse(json)
		return this
	}

	toJson(): string {
		return JSON.stringify(this.fields)
	}
}

export interface Jsonable {
	fromJson(json: string): this
	toJson(): string
}

export interface Display {
	display(): string
}

export interface StructuredError extends Error, Display {
	readonly name: string
	readonly fields: Fields
}
