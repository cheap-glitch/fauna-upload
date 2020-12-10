import got from 'got';
import dotenv from 'dotenv';

export { wait } from '../src/utils';

dotenv.config();
export const secret = process.env.FAUNA_TEST_DB_TOKEN || '';

// export const client = createFaunaClient(secret);

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
