// import FaunaExpr from 'faunadb/src/types/Expr';
import { Client as FaunaClient, Expr as FaunaExpr, query as q } from 'faunadb';

export class Database {
	name: string;
	private client: FaunaClient;

	async createCollection(name: string): Promise<void> {
		await this.query(q.CreateCollection(name));
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
			process.exit(1);
		}

		return response as any;
	}

	private constructor(name: string, client: FaunaClient) {
		this.name   = name;
		this.client = client;
	}
}
