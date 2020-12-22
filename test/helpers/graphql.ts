import { fetch } from 'fetch-h2';

export async function typeExists(secret: string, typeName: string): Promise<boolean | undefined> {
	return (await graphql(secret, '{ __schema { types { name } } }')).__schema.types.some((type: Record<string, string>) => type.name == typeName);
}

async function graphql(secret: string, query: string): Promise<any> {
	const response = await fetch('https://graphql.fauna.com/graphql', {
		method:  'POST',
		headers: { Authorization: `Bearer ${secret}` },
		json:    { query },
	});

	return (await response.json()).data;
}
