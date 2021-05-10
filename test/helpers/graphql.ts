import { fetch } from 'fetch-h2';

export async function typeExists(secret: string, typeName: string): Promise<boolean | undefined> {
	return (await graphql(secret, '{ __schema { types { name } } }')).__schema.types.some((type: Record<string, string>) => type.name === typeName);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function graphql(secret: string, query: string): Promise<any> {
	const response = await fetch('https://graphql.fauna.com/graphql', {
		json: { query },
		method: 'POST',
		headers: { Authorization: `Bearer ${secret}` },
	});

	return (await response.json()).data;
}
