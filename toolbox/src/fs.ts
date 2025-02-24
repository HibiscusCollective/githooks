import type { MakeDirectoryOptions, ObjectEncodingOptions, PathLike } from 'fs'
import * as fs from 'fs'
import * as path from 'path'
import { err, ok, type Result, type StructuredError } from './result'
import { Fields } from './structured_error'

export enum FSErrorCode {
	Unknown = 'unknown error',
	ReadDirError = 'failed to read directory contents',
	CopyError = 'failed to copy file(s) and/or director(ies)',
}

export interface FSLike {
	readdir: (
		path: PathLike,
		options?: (ObjectEncodingOptions & { withFileTypes?: false | undefined; recursive?: boolean | undefined }) | BufferEncoding | null
	) => Promise<string[]>
	copyFile: (src: PathLike, dest: PathLike) => Promise<void>
	cp: (source: string | URL, destination: string | URL, opts?: fs.CopyOptions) => Promise<void>
	mkdir(path: PathLike, options: MakeDirectoryOptions & { recursive: true }): Promise<string | undefined>
	stat: (path: PathLike) => Promise<{ isFile: () => boolean; isDirectory: () => boolean }>
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

export class FSError implements StructuredError {
	readonly name: string = 'FSError'
	readonly code: FSErrorCode
	readonly message: string
	readonly fields?: Fields
	readonly cause?: Error

	static ReadDirError({ cause, dir }: { cause?: Error; dir: PathLike }): FSError {
		return new FSError(FSErrorCode.ReadDirError, cause, new Fields({ path: dir.toLocaleString() }))
	}

	static CopyError({ cause, srcs, dsts }: { cause?: Error; srcs: PathLike[]; dsts: PathLike[] }): FSError {
		const fields = new Fields({ srcs: srcs.map(src => src.toLocaleString()), dsts: dsts.map(dst => dst.toLocaleString()) })
		return new FSError(FSErrorCode.CopyError, cause, fields)
	}

	private constructor(code: FSErrorCode, cause?: Error, fields?: Fields) {
		this.code = code
		this.message = code.toString()
		this.cause = cause
		this.fields = fields
	}

	display(): string {
		return `${this.message}: ${this.cause?.message}`
	}

	json(): string {
		return JSON.stringify({
			message: this.message,
			cause: this.cause,
			stacktrace: this.cause?.stack,
			...this.fields,
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

export class AsyncFS {
	readonly io: FSLike

	constructor(io: FSLike = fs.promises) {
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
			if (error instanceof Error) {
				return err(FSError.CopyError({ cause: error, srcs: [source], dsts: [dest] }))
			}

			throw error
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

	private async copyFile(src: PathLike, dst: PathLike): Promise<Result<FileLike>> {
		try {
			await this.io.copyFile(src, dst)
			return ok(new FileInfo(dst))
		} catch (error) {
			if (error instanceof Error) {
				return err(new FSError('failed to copy file to file', error, src))
			}

			throw error
		}
	}
}
