import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'

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

		describe('when the ls command is invoked on the testdata directory', async () => {
			const files = await new AsyncFS().ls(testdataDir)

			it('it should return a list of files and directories in the testdata directory', () => {
				expect(files).toContainAllValues([
					new DirInfo(path.join(testdataDir, 'subdir')),
					new FileInfo(path.join(testdataDir, 'test.txt')),
					new FileInfo(path.join(testdataDir, 'empty.txt')),
				])
			})
		})

		describe('when the ls command is invoked on a non-existent directory', async () => {
			it('it should throw an FSError', () => {
				expect(() => new AsyncFS().ls('/non-existent-dir')).toThrowError({
					message: 'no such file or directory',
					reason: 'ENOENT',
					path: '/non-existent-dir',
				})
			})
		})
	})
})

describe('given an FSError', () => {
	describe('when the message, reason and path are set', () => {
		const fsError = new FSError('test message', 'test reason', '/test/path')

		it('it should display the error message as "test message: "/test/path": test reason"', () => {
			expect(fsError.display()).toBe('test message: "/test/path": test reason')
		})

		it('it should return a structured error as json', () => {
			expect(fsError.json()).toStrictEqual(
				JSON.stringify({
					message: 'test message',
					reason: 'test reason',
					path: '/test/path',
				})
			)
		})
	})
})
