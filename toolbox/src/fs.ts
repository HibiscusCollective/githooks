import type { PathLike } from 'fs'
import * as fs from 'fs'
import * as path from 'path'
import { err, ok, type Result } from './result'

export interface FSLike {
	ls: (path: PathLike, options?: LsOptions) => Promise<Result<FileLike[]>>
	cp: (source: PathLike, dest: PathLike) => Promise<Result<FileLike[]>>
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
	readonly reason: Error
	readonly path: PathLike

	constructor(message: string, reason: Error, path: PathLike) {
		super(message)

		this.name = 'FSError'
		this.reason = reason
		this.path = path
	}

	display(): string {
		return `${this.message}: "${this.path}": ${this.reason.message}`
	}

	json(): string {
		return JSON.stringify({
			message: this.message,
			reason: this.reason,
			path: this.path,
		})
	}
}

export class FSErrorList extends Error {
	readonly errs: FSError[]

	constructor(...errs: FSError[]) {
		super('multiple errors')
		this.errs = errs
	}
}

const DEFAULT_LS_OPTS: LsOptions = { recursive: false, files: true, directories: true }

export class AsyncFS implements FSLike {
	io: typeof fs.promises

	constructor(io: typeof fs.promises = fs.promises) {
		this.io = io
	}

	async ls(p: PathLike, options: LsOptions = DEFAULT_LS_OPTS): Promise<Result<FileLike[]>> {
		let result = await this.listDirEntries(p)
		if (result.err()) {
			return err(result.err()!)
		}

		const infos = await Promise.all(
			result.ok()!.map(async file => {
				const filePath = path.resolve(p.toLocaleString(), file)
				const stat = await this.io.stat(filePath)

				return stat.isDirectory() ? new DirInfo(filePath) : new FileInfo(filePath)
			})
		)

		return ok(infos)
	}

	async cp(source: PathLike, dest: PathLike): Promise<Result<FileLike[]>> {
		try {
			if (await this.isFile(source)) {
				await this.io.copyFile(source, dest)
			}

			if (await this.isDir(source)) {
				await this.io.mkdir(dest, { recursive: true })
				await this.io.cp(source.toLocaleString(), dest.toLocaleString(), { recursive: true })
			}

			return await this.ls(dest)
		} catch (error) {
			throw new Error('Error handling not implemented', { cause: error })
		}
	}

	async mkdirp(p: PathLike): Promise<Result<PathLike>> {
		const abs = await this.absPath(p)
		return abs
	}

	private async absPath(p: PathLike): Promise<Result<PathLike>> {
		const absPath = path.resolve(p.toLocaleString())

		return ok(absPath)
	}

	private async listDirEntries(p: PathLike): Promise<Result<string[]>> {
		try {
			return ok(await this.io.readdir(p))
		} catch (error) {
			if (error instanceof Error) {
				return err(new FSError('failed to read directory', error, p))
			}

			throw error
		}
	}

	private async isFile(p: PathLike): Promise<boolean> {
		return (await this.io.stat(p)).isFile()
	}

	private async isDir(p: PathLike): Promise<boolean> {
		return (await this.io.stat(p)).isDirectory()
	}
}
