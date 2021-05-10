import { Expr as FaunaExpression, ExprArg as FaunaExpressionArg, Client as FaunaClient, query as q } from 'faunadb';

import { createLocalFaunaClient } from './client';
import { createFaunaClient } from '../../src/lib/client';

type FaunaIndexTerm   = Record<string, Array<string>>;
type FaunaIndexParams = Record<string, boolean | string | Array<FaunaIndexTerm>>;

export class Database {
	private name:     string;
	private secret:   string;
	private client:   FaunaClient;
	private isRemote: boolean;

	async collectionExists(name: string): Promise<boolean> {
		return Boolean(await this.client.query(q.Exists(q.Collection(name))));
	}

	async documentExists(index: string, key: string): Promise<boolean> {
		return Boolean(await this.client.query(q.Exists(q.Match(q.Index(index), key))));
	}

	async documentHasProperty(index: string, key: string, prop: string): Promise<boolean> {
		return Boolean(await this.client.query(q.Select(['data', prop], q.Get(q.Match(q.Index(index), key)), undefined)));
	}

	async indexExists(name: string): Promise<boolean> {
		return Boolean(await this.client.query(q.Exists(q.Index(name))));
	}

	async functionExists(name: string): Promise<boolean> {
		return Boolean(await this.client.query(q.Exists(q.Function(name))));
	}

	async roleExists(name: string): Promise<boolean> {
		return Boolean(await this.client.query(q.Exists(q.Role(name))));
	}

	async callFunction(name: string, ...args: Array<FaunaExpressionArg>): Promise<unknown> {
		return await this.client.query(q.Call(q.Function(name), ...args));
	}

	async createCollection(name: string): Promise<void> {
		await this.client.query(q.CreateCollection({ name }));
	}

	async createDocument(collection: string, data: Record<string, boolean | number | string>): Promise<void> {
		await this.client.query(q.Create(collection, { data }));
	}

	async createIndex(collection: string, name: string, params: FaunaIndexParams): Promise<void> {
		await this.client.query(q.Let(
			{
				source: q.Collection(collection),
			},
			q.CreateIndex({
				name,
				source: q.Var('source'),
				...params,
			})
		));
	}

	async createFunction(name: string, body: FaunaExpression): Promise<void> {
		await this.client.query(q.CreateFunction({ name, body }));
	}

	async destroy(adminSecret: string): Promise<void> {
		const adminClient = this.isRemote ? createFaunaClient(adminSecret) : createLocalFaunaClient(adminSecret);

		await adminClient.query(q.Do(
			q.Delete(q.Select(['ref'], q.KeyFromSecret(this.secret))),
			q.Delete(q.Database(this.name))
		));
	}

	getName(): string {
		return this.name;
	}

	getSecret(): string {
		return this.secret;
	}

	getClient(): FaunaClient {
		return this.client;
	}

	static async create(adminSecret: string, name: string, isRemote = false): Promise<Database> {
		const adminClient = isRemote ? createFaunaClient(adminSecret) : createLocalFaunaClient(adminSecret);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { ref } = await adminClient.query(q.CreateDatabase({ name })) as any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { secret } = await adminClient.query(q.CreateKey({ database: ref, role: 'admin' })) as any;

		return new Database(name, secret, isRemote);
	}

	private constructor(name: string, secret: string, isRemote: boolean) {
		this.name     = name;
		this.secret   = secret;
		this.isRemote = isRemote;
		this.client   = this.isRemote ? createFaunaClient(this.secret) : createLocalFaunaClient(this.secret);
	}
}
