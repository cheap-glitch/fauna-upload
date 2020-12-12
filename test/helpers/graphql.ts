import { fetch } from 'fetch-h2';

export async function typeExists(secret: string, typeName: string | RegExp): Promise<boolean | undefined> {
	const data = await queryGraphql(secret, '{ __schema { types { name } } }');
	if (!data || !data.__schema || !data.__schema.types) {
		return undefined;
	}

	return data.__schema.types.some((type: Record<string, string>) => {
		return (typeof typeName == 'string') ? typeName == type.name : typeName.test(type.name);
	});
}

async function queryGraphql(secret: string, query: string): Promise<any | undefined> {
	const response = await fetch('https://graphql.fauna.com/graphql', {
		method:  'POST',
		headers: { Authorization: `Bearer ${secret}` },
		json:    { query },
	});

	let json;
	try {
		json = await response.json();
	} catch (error) {
		console.error(error);

		return undefined;
	}

	return json.data || undefined;
}
