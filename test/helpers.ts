import dotenv from 'dotenv';
import { fetch } from 'fetch-h2';

import * as log from '../src/utils/log';
import { createFaunaClient } from '../src/utils/client';

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
export const client = createFaunaClient(secret);

export { wait } from '../src/utils';

export async function isTypeInSchema(typeName: string | RegExp): Promise<boolean | undefined> {
	const data = await graphql('{ __schema { types { name } } }');
	if (!data || !data.__schema || !data.__schema.types) {
		return undefined;
	}

	return data.__schema.types.some((type: Record<string, string>) => {
		return (typeof typeName == 'string') ? typeName == type.name : typeName.test(type.name);
	});
}

// @FIXME: remove `any` type
async function graphql(query: string): Promise<any | undefined> {
	const response = await fetch('https://graphql.fauna.com/graphql', {
		method:  'POST',
		headers: { Authorization: `Bearer ${secret}` },
		json:    { query },
	});

	let json;
	try {
		json = await response.json();
	} catch (error) {
		log.error(error);

		return undefined;
	}

	return json.data || undefined;
}
