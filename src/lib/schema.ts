import { fetch, Response, AbortError, TimeoutError } from 'fetch-h2';

import { wait } from '../utils';

interface UploadOptions {
	override?: boolean
	previews?: Array<string>
}

export async function uploadSchema(schema: NodeJS.ReadableStream, secret: string, options: UploadOptions): Promise<Response | AbortError | TimeoutError> {
	const override = options.override || false;
	const previews = options.previews || [];

	const query = fetch('https://graphql.fauna.com/import' + (override ? '?mode=override' : ''), {
		body: schema,
		method: 'POST',
		headers: {
			'Authorization':    `Bearer ${secret}`,
			'Content-Type':     'text/plain',
			'X-Schema-Preview': previews.join(),
		},
	});

	let response;
	try {
		response = await query;
	} catch(error) {
		return error;
	}

	if (override) {
		await wait(60 * 1000);
	}

	return response;
}
