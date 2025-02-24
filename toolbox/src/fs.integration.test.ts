import { afterAll, afterEach, beforeAll, beforeEach, describe, test, expect, it, mock } from 'bun:test'

import type { PathLike } from 'fs'
import * as fs from 'fs'
import * as path from 'path'
import { AsyncFS, DirInfo, FileInfo, FSError, FSErrorCode } from './fs'

const FSPROMISES_ID = 'fs/promises'

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
			mock.module(FSPROMISES_ID, () => ({
				readdir: () => {
					throw new Error('test error')
				},
			}))
		})

		afterAll(() => {
			mock.restore()
		})

		const mockfs = await import(FSPROMISES_ID)

		test('when the ls command is invoked on the "/errdir" directory', async () => {
			const result = await new AsyncFS(mockfs).ls('/errdir')

			it('it should not return any files', () => {
				expect(result.ok()).toBeUndefined()
			})

			it('it should return an FSError object', async () => {
				expect(result.err()).toEqual(FSError.ReadDirError({ cause: new Error('test error'), dir: '/errdir' }))
			})
		})
	})

	describe('and a mock fs implementation configured to throw an error on copying any file', async () => {
		const TEST_ERR = new Error('test error', { cause: new Error('inner error') })

		beforeAll(() => {
			mock.module(FSPROMISES_ID, () => ({
				copyFile: () => {
					throw TEST_ERR
				},
			}))
		})

		afterAll(() => {
			mock.restore()
		})

		const mockfs = await import(FSPROMISES_ID)

		test('when the cp command is invoked with a file source and file destination', async () => {
			const result = await new AsyncFS(mockfs).cp('src/test.txt', 'dst/test.txt')

			it('it should not return any files', () => {
				expect(result.ok()).toBeUndefined()
			})

			it('it should return an FSError object', async () => {
				expect(result.err()).toEqual(FSError.CopyError({ cause: new Error('test error'), srcs: ['src/test.txt'], dsts: ['dst/test.txt'] }))
			})
		})

		test('when the cp command is invoked with a file source and a directory destination', async () => {
			const result = await new AsyncFS(mockfs).cp('src/test.txt', 'dst')

			it('it should not return any files', () => {
				expect(result.ok()).toBeUndefined()
			})

			it('it should return an FSError object', async () => {
				expect(result.err()).toEqual(FSError.CopyError({ cause: new Error('test error'), srcs: ['src/test.txt'], dsts: ['dst'] }))
			})
		})

		test('when the cp command is invoked with a file source and a directory destination', async () => {
			const result = await new AsyncFS(mockfs).cp('src/test.txt', 'dst')

			it('it should not return any files', () => {
				expect(result.ok()).toBeUndefined()
			})

			it('and it should return an FSError object', async () => {
				const fsErr = result.err() as FSError

				expect(fsErr).toEqual(FSError.CopyError({ cause: new Error('test error'), srcs: ['src/test.txt'], dsts: ['dst'] }))

				it('and it should have the name "FSError" and code "CopyError"', () => {
					expect(fsErr.name).toBe('FSError')
					expect(fsErr.code).toBe(FSErrorCode.CopyError)
				})

				it('and it should display the error message as "failed to copy file(s) and/or director(ies): test reason"', () => {
					expect(fsErr.display()).toBe('failed to copy file(s) and/or director(ies): test reason')
				})

				it('and it should return a structured error containing sources and destinations as json', () => {
					let err = new Error('test reason')

					expect(fsErr.json()).toStrictEqual(
						JSON.stringify({
							message: 'failed to copy file(s) and/or director(ies)',
							reason: TEST_ERR.cause,
							stack: TEST_ERR.stack,
							code: 'CopyError',
							srcs: ['src/test.txt'],
							dsts: ['dst'],
						})
					)
				})
			})
		})
	})
})
