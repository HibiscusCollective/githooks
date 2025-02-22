import type { PathLike } from 'fs'
import * as fs from 'fs'
import * as path from 'path'
import { ok, type Result } from './result'

export interface FSLike {
	ls: (path: PathLike, options?: LsOptions) => Promise<FileLike[]>
	cp: (source: PathLike, dest: PathLike) => Promise<Result<PathLike>>
	mkdirp(p: PathLike): Promise<Result<PathLike>>
}

export interface LsOptions {
	readonly recursive: boolean
	readonly files: boolean
	readonly directories: boolean
}

export interface FileLike {
	readonly path: PathLike
	readonly isDirectory: boolean
}

export class FileInfo implements FileLike {
	readonly path: PathLike
	readonly isDirectory: false

	constructor(path: PathLike) {
		this.path = path
		this.isDirectory = false
	}
}

export class DirInfo implements FileLike {
	readonly path: PathLike
	readonly isDirectory: true

	constructor(path: PathLike) {
		this.path = path
		this.isDirectory = true
	}
}

export class FSError extends Error {
	constructor(message: string, reason: string, path: PathLike) {
		super(message)

		this.name = 'FSError'
		this.reason = reason
		this.path = path
	}

	readonly reason: string
	readonly path: PathLike

	display(): string {
		return `${this.message}: "${this.path}": ${this.reason}`
	}

	json(): string {
		return JSON.stringify({
			message: this.message,
			reason: this.reason,
			path: this.path,
		})
	}
}

const DEFAULT_LS_OPTS: LsOptions = { recursive: false, files: true, directories: true }

export class AsyncFS implements FSLike {
	async ls(p: PathLike, options: LsOptions = DEFAULT_LS_OPTS): Promise<FileLike[]> {
		const files = await fs.promises.readdir(p)

		const infos = await Promise.all(
			files.map(async file => {
				const filePath = path.resolve(p.toLocaleString(), file)
				const stat = await fs.promises.stat(filePath)

				return stat.isDirectory() ? new DirInfo(filePath) : new FileInfo(filePath)
			})
		)

		return infos
	}

	async cp(source: PathLike, dest: PathLike): Promise<Result<PathLike>> {
		return ok(dest)
	}

	async mkdirp(p: PathLike): Promise<Result<PathLike>> {
		const abs = await this.absPath(p)
		return abs
	}

	private async absPath(p: PathLike): Promise<Result<PathLike>> {
		const absPath = path.resolve(p.toLocaleString())

		return ok(absPath)
	}
}
