import { Client as FaunaClient, Expr as FaunaExpr, query as q } from 'faunadb';

type FaunaIndexTerm   = Record<string, Array<string>>;
type FaunaIndexParams = Record<string, boolean | string | Array<FaunaIndexTerm>>;

export class Database {
	name: string;
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

	async destroy(): Promise<void> {
		await this.query(q.Delete(q.Database(this.name)));
	}

	static async create(name: string, client: FaunaClient): Promise<Database> {
		const db = new Database(name, client);
		await db.query(q.CreateDatabase({ name }));

		return db;
	}

	async query(query: FaunaExpr): Promise<any> {
		let response;
		try {
			response = await this.client.query(query);
		} catch (error) {
			console.error(error);

			return undefined;
		}

		return response as any;
	}

	private constructor(name: string, client: FaunaClient) {
		this.name   = name;
		this.client = client;
	}
}
