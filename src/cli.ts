import ora from 'ora';
import chalk from 'chalk';
import yargs from 'yargs';
import dotenv from 'dotenv';
import confirm from 'yesno';
import findUp from 'find-up';

import { query as q } from 'faunadb';
import { CompilerOptions as TSCompilerOptions } from 'typescript';

import { createReadStream } from 'fs';
import { tmpdir as osTempDir } from 'os';
import { posix, join as joinPaths } from 'path';
const  { resolve: resolvePosixPath, parse: parsePosixPath } = posix;
import { stat as getPathStats, readdir as getDirectoryEntries, readFile as getFileContents, mkdtemp as makeTempDir } from 'fs/promises';

import { uploadSchema } from './lib/schema';
import { uploadResources } from './lib/resources';
import { uploadDocuments } from './lib/documents';
import { createFaunaClient } from './lib/client';
import { FaunaResourceType, FaunaRole, FaunaIndex, FaunaFunction, FaunaDocumentBundle } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version }            = require('../../package.json');
const ALLOWED_EXTENSIONS     = ['gql', 'graphql', 'js', 'ts', 'json'];
const CONFIRMATION_MESSAGE   = 'Are you sure you want to upload a GraphQL schema in override mode?\nAll documents and resources related to the previous schema will be erased! (y/n)';
const SETUP_INSTRUCTIONS_URL = 'https://github.com/cheap-glitch/fauna-upload#usage';

const SYMBOL_SUCCESS = chalk.bold.green('✓');
const SYMBOL_WARNING = chalk.bold.yellow('!');
const SYMBOL_ERROR   = chalk.bold.red('✗');

export async function cli(): Promise<void> {
	const configPath = await findUp(['.faunarc.json', '.fauna.json']);

	const options = yargs(process.argv.slice(2))
		.parserConfiguration({
			// FIXME: 'parse-positional-numbers': false,
			'boolean-negation':          false,
			'duplicate-arguments-array': false,
			'strip-aliased':             true,
			'strip-dashed':              true,
		})
		.usage(`fauna-upload v${version}\n`)
		.usage(`> For detailed setup instructions, see:\n> ${SETUP_INSTRUCTIONS_URL}\n`)
		.usage('Usage:\n  $0 [OPTION]... <PATH>...')
		.example([
			['fauna-upload schema.gql',       'Process a single file'],
			['fauna-upload src/**.{js,json}', 'Process several files'],
			['fauna-upload ../data',          'Process all files in a directory'],
		])
		.options({
			// FIXME when https://github.com/yargs/yargs/issues/1679 is done
			bail:      { alias: ['b', 'bail-after'], type: 'number',  desc: 'Exit immediately upon n failed uploads (n defaults to 1)'               },
			'dry-run': { alias: 'n',                 type: 'boolean', desc: 'Print the details of the operations without executing them'             },
			check:     { alias: 'ping',              type: 'boolean', desc: 'Check that fauna-upload can access the database'                        },
			env:       {                             type: 'string',  desc: 'Set the name of the environment variable holding the database secret'   },
			override:  {                             type: 'boolean', desc: 'Import GraphQL schemas in override mode (https://tinyurl.com/66yytamk)' },
			previews:  {                             type: 'array',   desc: 'Enable schema previews (https://tinyurl.com/5avxms8u)'                  },
			quiet:     { alias: 'q',                 type: 'boolean', desc: 'Do not print anything to stdout'                                        },
			tsconfig:  {                             type: 'string',  desc: 'Set the path of the config file for the TypeScript compiler '           },
			verbose:   { alias: 'v',                 type: 'boolean', desc: 'Enable verbose output'                                                  },
			yes:       { alias: ['y', 'no-confirm'], type: 'boolean', desc: 'Do not ask for confirmation when importing schemas in override mode'    },
		})
		.conflicts('quiet', 'verbose')
		.config(configPath !== undefined ? JSON.parse(await getFileContents(configPath, { encoding: 'utf8' })) : {})
		.pkgConf('fauna')
		.epilogue('Copyright © 2021-present, cheap glitch')
		.epilogue('This software is distributed under the ISC license')
		.showHelpOnFail(false, 'Try --help for more information')
		.argv;

	if (options._.length === 0) {
		yargs.showHelp();
		return;
	}

	function log(message: string): void {
		if (options.verbose) {
			console.info(message);
		}
	}

	function info(message: string): void {
		if (!options.quiet) {
			console.info(message);
		}
	}

	function success(message: string): void {
		if (!options.quiet) {
			console.info(SYMBOL_SUCCESS + ' ' + message);
		}
	}

	function warn(message: string): void {
		if (!options.quiet) {
			console.warn(SYMBOL_WARNING + ' ' + message);
		}
	}

	function error(message: string, details?: string): void {
		if (!options.quiet) {
			console.error(SYMBOL_ERROR + ' ' + getErrorMessage(message, details));
		}
		process.exitCode = 1;
	}

	const spinner = ora({ isSilent: options.quiet });

	function spinnerStart(message: string): void {
		if (!options.quiet) {
			spinner.start(message);
		}
	}

	function spinnerSuccess(message: string): void {
		if (!options.quiet) {
			spinner.stopAndPersist({ symbol: SYMBOL_SUCCESS, text: message });
		}
	}

	function spinnerError(message: string, details?: string): void {
		if (!options.quiet) {
			spinner.stopAndPersist({ symbol: SYMBOL_ERROR, text: getErrorMessage(message, details) });
		}
		process.exitCode = 1;
	}

	dotenv.config();
	const faunaSecret = process.env[options.env ?? 'FAUNADB_SECRET'] ?? '';
	if (faunaSecret === '') {
		return error('Database secret is missing', `See ${SETUP_INSTRUCTIONS_URL} for detailed setup instructions`);
	}

	if (options.override && !options.yes && options.confirm !== false && options.dryRun && !(await confirm({ question: CONFIRMATION_MESSAGE }))) {
		process.exitCode = 1;
		return;
	}

	if (options.check) {
		const faunaClient = createFaunaClient(faunaSecret);
		try {
			await faunaClient.ping();
		} catch (error) {
			return error('Failed to ping database', error.message);
		}

		let response: boolean | undefined;
		try {
			response = await faunaClient.query(q.IsEmpty(q.Paginate(q.Keys())));
		} catch (error) {
			return error('Failed to access database', error.message);
		}
		if (response === true) {
			return error('Failed to access database');
		}

		return success('Successfully confirmed database access');
	}

	const userFilePaths: Array<string> = [];
	for (const userPath of options._) {
		const path = resolvePosixPath(process.cwd(), userPath.toString());

		let pathStats;
		try {
			pathStats = await getPathStats(path);
		} catch (error) {
			return error(`Failed to load "${path}"`, error.message);
		}

		if (pathStats.isFile()) {
			if (!ALLOWED_EXTENSIONS.includes(getFileExtension(path))) {
				return error('Filename must end in one of the following extensions: ' + ALLOWED_EXTENSIONS.join(', '));
			}

			userFilePaths.push(path);
			continue;
		}
		if (pathStats.isDirectory()) {
			userFilePaths.push(...(await getDirectoryEntries(path, { withFileTypes: true }))
				.filter(entry => entry.isFile())
				.map(entry => resolvePosixPath(path, entry.name))
			);
		}
	}

	const filePaths       = [...new Set(userFilePaths)];
	const typescriptFiles = filePaths.filter(filePath => getFileExtension(filePath) === 'ts');

	log(`Loading ${count(filePaths, 'file')}:\n  ` + filePaths.join('\n  '));

	if (typescriptFiles.length > 0) {
		log('Compiling TypeScript files…');

		let tsc;
		try {
			tsc = await import('typescript');
		} catch (error) {
			return error('Failed to load `typescript` module, please make sure you have installed it', error.message);
		}

		let compilerOptions: TSCompilerOptions;
		const tsConfigPath = typeof options.tsconfig === 'string' ? options.tsconfig : await findUp(['tsconfig.json']);
		if (tsConfigPath === undefined) {
			compilerOptions = tsc.getDefaultCompilerOptions();
		} else {
			const tsConfig = tsc.parseConfigFileTextToJson(tsConfigPath, await getFileContents(tsConfigPath, { encoding: 'utf8' }));
			if (tsConfig.error) {
				return error(tsc.flattenDiagnosticMessageText(tsConfig.error.messageText, '\n'));
			}

			compilerOptions = tsc.convertCompilerOptionsFromJson(
				tsConfig.config.compilerOptions,
				parsePosixPath(tsConfigPath).dir,
				parsePosixPath(tsConfigPath).base
			).options;
		}
		compilerOptions.outDir = await makeTempDir(joinPaths(osTempDir(), 'fauna-resource'));
		compilerOptions.listEmittedFiles = true;

		const program     = tsc.createProgram(typescriptFiles, compilerOptions);
		const result      = program.emit();
		const diagnostics = tsc.getPreEmitDiagnostics(program).concat(result.diagnostics);

		for (const diagnostic of diagnostics) {
			if (diagnostic.file && diagnostic.start) {
				const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
				const message = tsc.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
				warn(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
			} else {
				warn(tsc.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
			}
		}

		if (result.emitSkipped) {
			return error('Error during TypeScript compilation');
		}
		if (result.emittedFiles) {
			filePaths.push(...result.emittedFiles);
		}
	}

	const schemas:         Array<string>              = [];
	const roles:           Array<FaunaRole>           = [];
	const indexes:         Array<FaunaIndex>          = [];
	const functions:       Array<FaunaFunction>       = [];
	const documentBundles: Array<FaunaDocumentBundle> = [];

	for (const filePath of filePaths) {
		switch (getFileExtension(filePath)) {
			case 'gql':
			case 'graphql':
				// TODO(1.0.0): check that the file exists and is accessible
				schemas.push(filePath);
				break;

			case 'js':
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				for (const item of wrapInArray(require(filePath))) {
					if ('privileges' in item) {
						roles.push(item);
						continue;
					}
					if ('source' in item) {
						indexes.push(item);
						continue;
					}
					if ('body' in item) {
						functions.push(item);
						continue;
					}
					if ('documents' in item) {
						documentBundles.push(item);
						continue;
					}
					return error(`Failed to compute resource type for "${filePath}"`);
				}
				break;

			case 'json':
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				documentBundles.push(...wrapInArray(require(filePath)));
				break;
		}
	}

	log('Uploading ' + enumerate(
		count(schemas,         'schema'),
		count(roles,           'role'),
		count(indexes,         'index'),
		count(functions,       'function'),
		count(documentBundles, 'document bundle'),
	));
	if (options.dryRun) {
		return;
	}

	let nbFailedUploads = 0;
	const bailThreshold = typeof options.bail === 'number' && !Number.isNaN(options.bail) ? options.bail : options.bail === undefined && ('bail' in options) ? 1 : Number.POSITIVE_INFINITY;

	for (const schema of schemas) {
		const filename = parsePosixPath(schema).base;
		spinnerStart(`Uploading schema "${filename}"…`);

		const stream = createReadStream(schema, { encoding: 'utf8' });
		const result = await uploadSchema(stream, faunaSecret, { previews: (options.previews ?? []).map(toString), override: options.override });
		stream.destroy();

		if (result instanceof Error) {
			spinnerError(`Failed to upload "${filename}"`, result.message);

			nbFailedUploads++;
			if (nbFailedUploads >= bailThreshold) {
				return info(getBailMessage(nbFailedUploads));
			}

			continue;
		}

		await result.text();
		spinnerSuccess(`Successfully uploaded "${filename}"`);
	}

	const resources = [
		{ type: FaunaResourceType.Role,     data: roles     },
		{ type: FaunaResourceType.Index,    data: indexes   },
		{ type: FaunaResourceType.Function, data: functions },
	];
	if (documentBundles.length === 0 && Object.values(resources).every(({ data }) => data.length === 0)) {
		return;
	}

	const faunaClient = createFaunaClient(faunaSecret);

	for (const { type, data } of resources) {
		if (data.length === 0) {
			continue;
		}

		spinnerStart(`Uploading ${count(data, type.toString())}…`);

		const result = uploadResources(faunaClient, type, data);
		if (result instanceof Error) {
			spinnerError('Upload failed', result.message);

			nbFailedUploads++;
			if (nbFailedUploads >= bailThreshold) {
				return info(getBailMessage(nbFailedUploads));
			}

			continue;
		}

		spinnerSuccess(`Successfully uploaded ${count(data, type.toString())})`);
	}

	if (documentBundles.length > 0) {
		const nbDocuments = documentBundles.reduce((total, bundle) => total += bundle.documents.length, 0);
		spinner.start(`Uploading ${count(nbDocuments, 'documents')}…`);

		const result = uploadDocuments(faunaClient, documentBundles);
		if (result instanceof Error) {
			spinnerError('Upload failed', result.message);

			nbFailedUploads++;
			if (nbFailedUploads >= bailThreshold) {
				return info(getBailMessage(nbFailedUploads));
			}

			return;
		}

		spinnerSuccess(`Successfully uploaded ${count(nbDocuments, 'document')} in ${count(documentBundles, 'bundle')}`);
	}
}

function enumerate(...words: Array<string>): string {
	const nonEmptyWords = words.filter(Boolean);
	switch (nonEmptyWords.length) {
		case 0:  return 'nothing';
		case 1:  return nonEmptyWords.join('');
		case 2:  return nonEmptyWords.join(' and ');
		default: return nonEmptyWords.slice(0, -1).join(', ') + ' and ' + nonEmptyWords.slice(-1);
	}
}

function count(number: number, word: string): string
function count(array: Array<unknown>, word: string): string
function count(numberOrArray: number | Array<unknown>, word: string): string {
	const count = Array.isArray(numberOrArray) ? numberOrArray.length : numberOrArray;

	return count === 0 ? '' : count === 1 ? `1 ${word}` : `${count} ${word}s`;
}

function wrapInArray<T>(value: T | Array<T>): Array<T> {
	return (Array.isArray(value)) ? value : [value];
}

function getFileExtension(path: string): string {
	return parsePosixPath(path).ext.slice(1);
}

function getBailMessage(nbFailedUploads: number): string {
	return `Reached ${nbFailedUploads} out of ${count(nbFailedUploads, 'failed upload')}, aborting`;
}

function getErrorMessage(message: string, details?: string): string {
	return message + (details ? ': ' + details : '');
}
