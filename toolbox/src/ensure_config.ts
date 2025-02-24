import type { PathLike } from 'fs'
import * as path from 'path'

import { AsyncFS } from './fs'
import { ok, type StructuredError } from './result'

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

export async function ensureConfig(fs: AsyncFS, { destDir, sources }: { destDir: PathLike; sources: PathLike[] }) {
	if (sources.length === 0) {
		return ok([])
	}

	const absDestDir = await fs.mkdirp(destDir)
	const copiedFiles = await Promise.all(
		sources.map(async source => {
			await fs.cp(source, path.join(absDestDir.toLocaleString(), path.basename(source.toLocaleString())))

			return source
		})
	)

	return ok(copiedFiles)
}
