import { Readable } from 'stream';
import { Response } from 'fetch-h2';

import { adminSecret } from './helpers/secret';
import { Database } from './helpers/database';
import { typeExists } from './helpers/graphql';

import { uploadSchema } from '../src/lib/schema';

const timestamp = '' + Date.now();

// Setup a new child database for the tests
let db: Database;
beforeAll(async () => {
	db = await Database.create(adminSecret, `fauna-upload-test-${timestamp}`);
});
afterAll(async () => {
	return db.destroy(adminSecret);
});

test("upload a new schema", async () => { // {{{

	// Action
	const result = await uploadSchema(Readable.from('type User { name: String! }'), db.getSecret(), { override: false });

	// Tests
	expect(result).toBeInstanceOf(Response);
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}); // }}}

test("update an existing schema", async () => { // {{{

	// Setup
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);

	// Action
	const result = await uploadSchema(Readable.from('type NewUser { name: String! }'), db.getSecret(), { override: false });

	// Tests
	expect(result).toBeInstanceOf(Response);
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);
	await expect(typeExists(db.getSecret(), 'NewUser')).resolves.toBe(true);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}); // }}}

test("error on invalid schema", async () => { // {{{

	// Action
	const result = await uploadSchema(Readable.from('type MyType { foo: String, bar: Boolean!'), db.getSecret(), { override: false });

	// Tests
	expect(result).toBeInstanceOf(Error);
	if (result instanceof Error) {
		expect(result.message).toMatch(/syntax error/i);
	}

}); // }}}
