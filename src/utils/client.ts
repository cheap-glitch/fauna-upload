import { Client as FaunaClient } from 'faunadb';
import fetch from 'node-fetch';

export function createFaunaClient(secret: string): FaunaClient | undefined {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore: https://github.com/fauna/faunadb-js/issues/341
	return new FaunaClient({ secret, fetch }); /* @FIXME */
}
