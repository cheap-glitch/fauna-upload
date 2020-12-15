import { Expr as FaunaExpr, Client as FaunaClient, query as q } from 'faunadb';

import { createFaunaClient } from '../../src/lib/client';

type FaunaIndexTerm   = Record<string, Array<string>>;
type FaunaIndexParams = Record<string, boolean | string | Array<FaunaIndexTerm>>;

export class Database {
	private name:   string;
	private secret: string;
	private client: FaunaClient;

	async documentHasProperty(index: string, key: string, prop: string): Promise<boolean> {
		return !!(await this.query(q.Select(['data', prop], q.Get(q.Match(q.Index(index), key)), undefined)));
	}

	async documentExists(index: string, key: string): Promise<boolean> {
		return await this.query(q.Exists(q.Match(q.Index(index), key)));
	}

	async indexExists(name: string): Promise<boolean> {
		return await this.query(q.Exists(q.Index(name)));
	}

	async collectionExists(name: string): Promise<boolean> {
		return await this.query(q.Exists(q.Collection(name)));
	}

	async createDocument(collection: string, data: Record<string, boolean | number | string>): Promise<void> {
		await this.query(q.Create(collection, { data }));
	}

	async createIndex(collection: string, name: string, params: FaunaIndexParams): Promise<void> {
		await this.query(q.Let(
			{
				source: q.Collection(collection),
			},
			q.CreateIndex({
				name,
				source: q.Var('source'),
				...params
			})
		));
	}

	async createCollection(name: string): Promise<void> {
		await this.query(q.CreateCollection({ name }));
	}

	async destroy(adminSecret: string): Promise<void> {
		await queryClient(createFaunaClient(adminSecret), q.Do(
			q.Delete(q.Select(['ref'], q.KeyFromSecret(this.secret))),
			q.Delete(q.Database(this.name))
		));
	}

	getName():   string      { return this.name;   }
	getSecret(): string      { return this.secret; }
	getClient(): FaunaClient { return this.client; }

	private async query(query: FaunaExpr): Promise<any> {
		return await queryClient(this.client, query);
	}

	static async create(adminSecret: string, name: string): Promise<Database> {
		const adminClient = createFaunaClient(adminSecret);

		const { ref    } = await queryClient(adminClient, q.CreateDatabase({ name }))!;
		const { secret } = await queryClient(adminClient, q.CreateKey({ database: ref, role: 'admin' }))!;

		return new Database(name, secret);
	}

	private constructor(name: string, secret: string) {
		this.name   = name;
		this.secret = secret;
		this.client = createFaunaClient(this.secret)
	}
}

async function queryClient(client: FaunaClient, query: FaunaExpr): Promise<any | undefined> {
	let response;
	try {
		response = await client.query(query);
	} catch (error) {
		/* istanbul ignore next */
		console.error(error);

		/* istanbul ignore next */
		return undefined;
	}

	return response;
}
