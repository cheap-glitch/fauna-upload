import { Client as FaunaClient } from 'faunadb';
import fetch from 'node-fetch';

import * as log from './log';

export function getFaunaClient(secret: string): FaunaClient | undefined {
	if (secret === undefined) {
		log.failure('Missing secret token');
		return undefined;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore: https://github.com/fauna/faunadb-js/issues/341
	return new FaunaClient({ secret, fetch }); /* @FIXME */
}
