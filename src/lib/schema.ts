import fetch from 'node-fetch';

import { wait } from '../utils';
import * as log from '../utils/log';

// @TODO: confirm override (outside of function)
export async function uploadSchema(schema: NodeJS.ReadableStream, secret: string, override = false, previews: Array<string> = []): Promise<boolean> {
	// @TODO: spinner
	// @TODO: extract messaging outside of function?
	if (override) {
		log.info('Overriding GraphQL schema...');
	} else {
		log.info('Updating GraphQL schema...');
	}

	const res = await fetch('https://graphql.fauna.com/import' + (override ? '?mode=override' : ''), {
		body: schema,
		method: 'POST',
		headers: {
			'Authorization':    `Bearer ${secret}`,
			'Content-Type':     'text/plain',
			'X-Schema-Preview': previews.join(),
		},
	}).catch(log.error);

	if (res === undefined) {
		return false;
	}
	if (!res.ok) {
		log.error(await res.text());
		return false;
	}

	log.success('GraphQL schema updated');
	if (override) {
		log.info('Waiting for the data to be removed...');
		wait(90 * 1000);
	}

	return true;
}
