import FaunaExpr from 'faunadb/src/types/Expr';
import { Client as FaunaClient, query as q } from 'faunadb';

export async function createCollection(client: FaunaClient, name: string): Promise<void> {
	await queryClient(client, q.CreateCollection(name));
}

export async function setupDatabase(client: FaunaClient, name: string): Promise<string> {
	const { ref    } = await queryClient(client, q.CreateDatabase({ name }));
	const { secret } = await queryClient(client, q.CreateKey({ role: 'server', database: ref }));

	return secret;
}

export async function destroyDatabase(client: FaunaClient, name: string): Promise<void> {
	await queryClient(client, q.Delete(q.Database(name)));
}

async function queryClient(client: FaunaClient, query: FaunaExpr): Promise<any> {
	let response;
	try {
		response = await client.query(query);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}

	return response as any;
}
