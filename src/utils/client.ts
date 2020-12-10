import { Client as FaunaClient } from 'faunadb';
import { fetch } from 'fetch-h2';

export function createFaunaClient(secret: string): FaunaClient {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore: https://github.com/fauna/faunadb-js/issues/341
	return new FaunaClient({ secret, fetch }); /* @FIXME */
}
