import { fetch, Response } from 'fetch-h2';

interface UploadSchemaOptions {
	override: boolean,
	previews: Array<string>,
	endpoint: string,
}

export async function uploadSchema(schema: NodeJS.ReadableStream, secret: string, options: Partial<UploadSchemaOptions> = {}): Promise<Response | Error> {
	const override = options.override ?? false;
	const previews = options.previews ?? [];
	const endpoint = options.endpoint ?? 'https://graphql.fauna.com';

	const query = fetch(endpoint + '/import' + (override ? '?mode=override' : ''), {
		body: schema,
		method: 'POST',
		headers: {
			'Content-Type':     'text/plain',
			'Authorization':    `Bearer ${secret}`,
			'X-Schema-Preview': previews.join(),
		},
	});

	let response;
	try {
		response = await query;
	} catch (error) {
		/* istanbul ignore next */
		return new Error(JSON.stringify(error, undefined, 2));
	}

	if (!response.ok) {
		return new Error(await response.text());
	}

	return response;
}
