import { fetch, Response } from 'fetch-h2';

export async function uploadSchema(schema: NodeJS.ReadableStream, secret: string, options: { override?: boolean, previews?: Array<string> } = {}): Promise<Response | Error> {
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
		/* istanbul ignore next */
		return new Error(JSON.stringify(error, null, 2));
	}

	if (!response.ok) {
		return new Error(await response.text());
	}

	return response;
}
