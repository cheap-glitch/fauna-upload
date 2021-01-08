#!/usr/bin/env node

import 'v8-compile-cache';

import { release } from 'os';
import { formatWithOptions } from 'util';

import { cli } from '../src/cli';

(async () => {
	process.on('uncaughtException',  onFatalError);
	process.on('unhandledRejection', onFatalError);
	await cli();
})()
.catch(onFatalError);

function onFatalError(error: unknown) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { version } = require('../../package.json');

	console.error([
		`fauna-upload v${version}`,
		`Node version: ${process.versions.node}`,
		`System: ${release()}`,
		'\nAn unexpected fatal error has occurred!\n',
		formatWithOptions({ colors: true }, '%o', error),
		// TODO: add link to GitHub issues
	].join('\n'));

	process.exitCode = 2;
}
