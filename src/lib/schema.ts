import fetch from 'node-fetch';

import * as log from '../utils/log';
import { wait } from '../utils/utils';

// @TODO: confirm override (outside of function)
export async function uploadSchema(schema: NodeJS.ReadableStream, secret: string, override = false, previews: Array<string> = []): Promise<boolean> {
	// @TODO: spinner
	if (override) {
		log.info('Overriding GraphQL schema...');
	} else {
		log.info('Updating GraphQL schema...');
	}

	// @TODO: replace with got?
	const res = await fetch('https://graphql.fauna.com/import' + (override ? '?mode=override' : ''), {
		body: schema,
		method: 'POST',
		headers: {
			'Authorization':    `Bearer ${secret}`,
			'Content-Type':     'text/plain',
			'X-Schema-Preview': previews.join(),
		},
	}).catch(log.failure);

	if (res === undefined) {
		return false;
	}
	if (!res.ok) {
		log.failure(await res.text());
		return false;
	}

	log.success('GraphQL schema updated');
	if (override) {
		log.info('Waiting for the data to be removed...');
		wait(90 * 1000);
	}

	return true;
}
