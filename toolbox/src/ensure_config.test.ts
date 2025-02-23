/* eslint-disable max-nested-callbacks -- allowed because bdd style tests require deeper nesting */
/* eslint-disable @typescript-eslint/no-magic-numbers -- magic numbers are acceptable in count assertions and such */
import { describe, expect, it } from 'bun:test'

import { EnsureConfigError } from './ensure_config'

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
