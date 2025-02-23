import type { PathLike } from 'fs'
import type { FSLike } from './fs'
import { ok, type StructuredError, type Result } from './result'
import * as path from 'path'

export class EnsureConfigError implements StructuredError {
	readonly name = 'EnsureConfigError'
	readonly message: string = 'failed to ensure configuration files are initialised'

	readonly destDir: PathLike
	readonly sources: PathLike[]
	readonly cause: Error | undefined

	constructor(params: { cause?: Error; destDir: PathLike; sources: PathLike[] }) {
		this.cause = params.cause
		this.destDir = params.destDir
		this.sources = params.sources
	}

	display(): string {
		return `${this.message}: [${this.sources.join(', ')}] >> ${this.destDir} : ${this.cause?.message}`
	}

	json(): string {
		return JSON.stringify({
			message: this.message,
			reason: this.cause,
			srcPaths: this.sources,
			dstDir: this.destDir,
		})
	}
}
