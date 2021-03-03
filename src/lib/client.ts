import { fetch } from 'fetch-h2';
import { Client as FaunaClient } from 'faunadb';

export function createFaunaClient(secret: string): FaunaClient {
	return new FaunaClient({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore FIXME: https://github.com/fauna/faunadb-js/issues/341
		fetch,
		secret,
	});
}
