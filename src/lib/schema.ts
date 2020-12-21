import { fetch, Response } from 'fetch-h2';

import { wait } from '../utils';

interface UploadOptions {
	override?: boolean
	previews?: Array<string>
}

export async function uploadSchema(schema: NodeJS.ReadableStream, secret: string, options: UploadOptions = {}): Promise<Response | Error> {
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
		return new Error(JSON.stringify(error, null, 2));
	}

	if (!response.ok) {
		return new Error(await response.text());
	}

	if (override) {
		await wait(60 * 1000);
	}

	return response;
}
