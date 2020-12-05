import { Client as FaunaClient } from 'faunadb';
import fetch from 'node-fetch';

import { secret } from './config';
import * as log from './log';

export function getFaunaClient(): FaunaClient | undefined {
	if (secret === undefined) {
		log.failure('Missing secret token');
		return undefined;
	}

	return new FaunaClient({ secret, fetch });
}
