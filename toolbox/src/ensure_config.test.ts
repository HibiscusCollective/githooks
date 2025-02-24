/* eslint-disable max-nested-callbacks -- allowed because bdd style tests require deeper nesting */
/* eslint-disable @typescript-eslint/no-magic-numbers -- magic numbers are acceptable in count assertions and such */
import { beforeEach, describe, expect, it, test } from 'bun:test'

import { memfs, type IFs, type NestedDirectoryJSON } from 'memfs'
import * as path from 'path'

import { ensureConfig, EnsureConfigError } from './ensure_config'
import { AsyncFS, type FSLike } from './fs'
import type { PathLike, MakeDirectoryOptions } from 'fs'

const dstPath = '/dest'
const srcPath = '/src'

class MemFSPromises implements FSLike {
	readonly mfs: IFs

	constructor(dirs: NestedDirectoryJSON) {
		this.mfs = memfs(dirs).fs
	}

	async readdir(path: PathLike): Promise<string[]> {
		return (await this.mfs.promises.readdir(path)).map(p => p.toLocaleString())
	}

	async copyFile(src: PathLike, dest: PathLike): Promise<void> {
		await this.mfs.promises.copyFile(src, dest)
	}

	async cp(source: PathLike, dest: PathLike): Promise<void> {
		await this.mfs.promises.cp(source.toLocaleString(), dest.toLocaleString())
	}

	async mkdir(path: PathLike, options: MakeDirectoryOptions & { recursive: true }): Promise<string | undefined> {
		return await this.mfs.promises.mkdir(path.toLocaleString(), { recursive: true })
	}

	async stat(path: PathLike): Promise<{ isFile: () => boolean; isDirectory: () => boolean }> {
		return await this.mfs.promises.stat(path.toLocaleString())
	}
}

describe('given an empty destination directory', () => {
	const dstSpec = {
		dstPath: {},
	}

	describe('and an empty source directory', () => {
		const srcSpec = {
			srcPath: {},
		}

		let memFS: MemFSPromises
		beforeEach(() => {
			memFS = new MemFSPromises({ ...dstSpec, ...srcSpec })
		})

		test('when the user invokes the ensure-config command with an empty source list', async () => {
			const fs = new AsyncFS(memFS)

			const result = await ensureConfig(fs, { destDir: dstPath, sources: [] })

			it('it should not return any errors', () => {
				expect(result.err()).toBeUndefined()
			})

			it('it should return a result of no copied files', () => {
				expect(result.ok()).toStrictEqual([])
			})

			it('and the destination directory should be empty', async () => {
				let dstFiles = await memFS.readdir(dstPath)

				expect(dstFiles).toStrictEqual([])
			})
		})
	})

	describe('and a source directory containing a test.cfg file', () => {
		const srcFileName = 'test.cfg'
		const srcFileContent = 'greeting = hello, world'

		const srcFilePath = path.join(srcPath, srcFileName)
		const srcSpec = {
			srcFilePath: srcFileContent,
		}

		let memFS: MemFSPromises
		beforeEach(() => {
			memFS = new MemFSPromises({ ...dstSpec, ...srcSpec })
		})

		test('when the user invokes the ensure-config command with the path to the source file', async () => {
			const fs = new AsyncFS(memFS)

			const result = await ensureConfig(fs, { destDir: dstPath, sources: [srcFilePath] })

			it('it should return a result of 1 copied file', () => {
				expect(result.ok()).toStrictEqual([srcFilePath])
			})
			it('and the destination directory should contain the source file', async () => {
				const dstFilePath = path.join(dstPath, srcFileName)

				expect(await memFS.readdir(dstPath)).toStrictEqual([dstFilePath])
			})
			it('it should not return any errors', () => {
				expect(result.err()).toBeUndefined()
			})
		})
	})
})

describe('given an EnsureConfigError', () => {
	describe('when the message, reason and path are set', () => {
		const testErr = new Error('test error')
		const testDst = '/dst'
		const testSrcs = ['/test/config1.yml', '/test/config2.json']

		const errMsg = 'failed to ensure configuration files are initialised'

		const fsError = new EnsureConfigError({ cause: testErr, destDir: testDst, sources: testSrcs })

		it(`it should display the error message as "${errMsg}: [${testSrcs.join(', ')}] >> ${testDst} : ${testErr.message}"`, () => {
			expect(fsError.display()).toBe(`${errMsg}: [${testSrcs.join(', ')}] >> ${testDst} : ${testErr.message}`)
		})

		it('it should return a structured error as json', () => {
			expect(fsError.json()).toStrictEqual(
				JSON.stringify({
					message: errMsg,
					reason: testErr,
					srcPaths: testSrcs,
					dstDir: testDst,
				})
			)
		})
	})
})
