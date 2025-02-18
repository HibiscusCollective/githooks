interface Params {
	args: string[]
	opts: Options
}

type Options = Record<string, Option<string | number | boolean>>

interface Option<T extends string | number | boolean> {
	value: T
	parse: (value: string) => Option<T>
}

export function parse(_: string[]): Params {
	return {
		args: [],
		opts: {},
	}
}
