import got from 'got';
import dotenv from 'dotenv';

import * as log from '../src/utils/log';

dotenv.config();
if (!process.env.FAUNA_TEST_DB_TOKEN) {
	log.error('Token for Fauna test database is missing');
	log.info('To test this module, please create a dummy Fauna database,\n'
	       + '  generate an  access key for it and add  the following line\n'
	       + '  to a .env file in the repo root:\n\n'
	       + '  FAUNA_TEST_DB_TOKEN=<key>');

	process.exit(1);
}

export const secret = process.env.FAUNA_TEST_DB_TOKEN;
// export const client = createFaunaClient(secret);

export { wait } from '../src/utils';

export async function isTypeInSchema(typeName: string): Promise<boolean> {
	const data = await graphql('{ __schema { types { name } } }');

	/* @FIXME: remove `any` type */
	return (data && data.__schema.types.some((type: any) => type.name == typeName));
}

async function graphql(query: string): Promise<any | undefined> {
	/* @FIXME: remove `any` type */
	const response: any = await got.post('https://graphql.fauna.com/graphql', {
		json:         { query },
		headers:      { Authorization: `Bearer ${secret}` },
		responseType: 'json',
	});

	return response?.body?.data ?? undefined;
}
