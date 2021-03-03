import 'jest-extended';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { Response } from 'fetch-h2';

import { Database } from './helpers/database';
import { typeExists } from './helpers/graphql';
import { uploadSchema } from '../src/lib/schema';

dotenv.config();
const secret    = process.env.FAUNADB_SECRET || '';
const timestamp = Date.now().toString();

let db: Database;
beforeAll(async () => {
	try {
		db = await Database.create(secret, `fauna-upload-${timestamp}`, true);
	} catch (error) {
		console.error(error);
	}
});
afterAll(async () => {
	try {
		await db.destroy(secret);
	} catch (error) {
		console.error(error);
	}
});

test('upload a new schema', async () => { // {{{

	// Action
	const result = await uploadSchema(Readable.from('type User { name: String! }'), db.getSecret(), { endpoint: 'https://graphql.fauna.com' });

	// Tests
	expect(result).toBeInstanceOf(Response);

	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}); // }}}

test('update an existing schema', async () => { // {{{

	// Setup
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);

	// Action
	const result = await uploadSchema(Readable.from('type NewUser { name: String! }'), db.getSecret());

	// Tests
	expect(result).toBeInstanceOf(Response);

	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);
	await expect(typeExists(db.getSecret(), 'NewUser')).resolves.toBe(true);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}); // }}}

test('enable schema previews', async () => { // {{{

	// Action
	const result = await uploadSchema(Readable.from('type MyType { foo: Int! }'), db.getSecret(), { previews: ['awesome-schema-preview'] });

	// Tests
	expect(result).toBeInstanceOf(Response);

	await expect(typeExists(db.getSecret(), 'MyType')).resolves.toBe(true);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}); // }}}

test('override an existing schema', async () => { // {{{

	// Setup
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);
	const timeBefore = Date.now();

	// Action
	const result = await uploadSchema(Readable.from('type MyCompletelyNewType { foo: Boolean! }'), db.getSecret(), { override: true });

	// Tests
	expect(Math.floor((Date.now() - timeBefore)/1000)).toBeWithin(60, 120);
	expect(result).toBeInstanceOf(Response);

	await expect(typeExists(db.getSecret(), 'MyCompletelyNewType')).resolves.toBe(true);
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(false);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}, 180*1000); // }}}

test('error on invalid schema', async () => { // {{{

	// Action
	const result = await uploadSchema(Readable.from('type MyInvalidType { foo: String, bar: Boolean!'), db.getSecret());

	// Tests
	expect(result).toBeInstanceOf(Error);
	expect(result instanceof Error ? result.message : '').toMatch(/syntax error/i);

}); // }}}
