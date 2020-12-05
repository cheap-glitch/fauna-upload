import { Client as FaunaClient } from 'faunadb';
import fetch from 'node-fetch';
// globalThis.fetch = fetch;

import { secret } from './config';
import * as log from './log';

export function getFaunaClient(): FaunaClient | undefined {
	if (secret === undefined) {
		log.failure('Missing secret token');
		return undefined;
	}

	// @ts-ignore: https://github.com/fauna/faunadb-js/issues/341
	return new FaunaClient({ secret, fetch });
}
