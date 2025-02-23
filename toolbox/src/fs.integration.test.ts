import { afterAll, afterEach, beforeAll, beforeEach, describe, test, expect, it, mock } from 'bun:test'

import type { PathLike } from 'fs'
import * as fs from 'fs'
import * as path from 'path'
import { AsyncFS, DirInfo, FileInfo, FSError } from './fs'

const TMP_DIR = 'tmp'
const INTEGRATION_TEST_DIR = path.join(TMP_DIR, 'integration')

beforeAll(() => {
	fs.promises.mkdir(INTEGRATION_TEST_DIR, { recursive: true })
})

describe('given a temporary directory', async () => {
	const tmpDirPrefix = 'fs_integration_test_'
	let tmpDir: PathLike

	beforeEach(async () => {
		tmpDir = await fs.promises.mkdtemp(tmpDirPrefix)
		expect(tmpDir).toBeDefined()
	})

	afterEach(async () => {
		await fs.promises.rm(tmpDir, { recursive: true, force: true })
		expect(await fs.promises.exists(tmpDir)).toBeFalse()
	})

	describe('and a testdata directory', async () => {
		const testdataDir = path.join(__dirname, 'testdata')
		expect(await fs.promises.exists(testdataDir)).toBeTrue()

		test('when the ls command is invoked on the testdata directory', async () => {
			const result = await new AsyncFS().ls(testdataDir)

			it('it should not return any errors', () => {
				expect(result.err()).toBeUndefined()
			})

			it('it should return a list of files and directories in the testdata directory', () => {
				expect(result.ok()).toContainAllValues([
					new DirInfo(path.join(testdataDir, 'subdir')),
					new FileInfo(path.join(testdataDir, 'test.txt')),
					new FileInfo(path.join(testdataDir, 'empty.txt')),
				])
			})
		})

		test('when the cp command is invoked to copy "testdata/test.txt" to "{tmpdir}/test_copy.txt"', async () => {
			const dest = path.join(tmpDir.toLocaleString(), 'test_copy.txt')
			const src = path.join(testdataDir, 'test.txt')

			const result = await new AsyncFS().cp(src, dest)

			it('it should not return any errors', () => {
				expect(result.err()).toBeUndefined()
			})

			it('it should copy the file', async () => {
				expect(await fs.promises.exists(dest)).toBeTrue()
				expect(await fs.promises.readFile(dest, 'utf-8')).toEqual(await fs.promises.readFile(src, 'utf-8'))
			})
		})

		test('when the cp command is invoked to copy the "testdata/" directory to "{tmpdir}/copy/"', async () => {
			const dest = path.join(tmpDir.toLocaleString(), 'copy')
			const src = path.join(testdataDir)

			const result = await new AsyncFS().cp(src, dest)

			it('it should not return any errors', () => {
				expect(result.err()).toBeUndefined()
			})

			it('it should copy the directory recursively', async () => {
				const srcFiles = await fs.promises.readdir(src, { recursive: true })
				const destFiles = await fs.promises.readdir(dest, { recursive: true })

				expect(srcFiles).toEqual(destFiles)

				for (const [i, src] of srcFiles.entries()) {
					const dst = destFiles[i]

					const srcContent = await fs.promises.readFile(path.join(src, src), 'utf-8')
					const dstContent = await fs.promises.readFile(path.join(dest, dst), 'utf-8')

					expect(srcContent).toEqual(dstContent)
				}
			})
		})
	})

	describe('and a mock fs implementation configured to throw an error on reading any directory', async () => {
		beforeAll(() => {
			mock.module('fs/promises', () => ({
				readdir: () => {
					throw new Error('test error')
				},
			}))
		})

		afterAll(() => {
			mock.restore()
		})

		const mockfs = await import('fs/promises')

		test('when the ls command is invoked on the "/errdir" directory', async () => {
			const result = await new AsyncFS(mockfs).ls('/errdir')

			it('it should not return any files', () => {
				expect(result.ok()).toBeUndefined()
			})

			it('it should return an FSError object', async () => {
				const result = await new AsyncFS(mockfs).ls('/errdir')

				expect(result.err()).toEqual(new FSError('failed to read directory', new Error('test error'), '/errdir'))
			})
		})
	})
})

describe('given an FSError', () => {
	describe('when the message, reason and path are set', () => {
		const fsError = new FSError('test message', new Error('test reason'), '/test/path')

		it('it should display the error message as "test message: "/test/path": test reason"', () => {
			expect(fsError.display()).toBe('test message: "/test/path": test reason')
		})

		it('it should return a structured error as json', () => {
			expect(fsError.json()).toStrictEqual(
				JSON.stringify({
					message: 'test message',
					reason: new Error('test reason'),
					path: '/test/path',
				})
			)
		})
	})
})
