import { adminSecret } from './helpers/secret';
import { Database } from './helpers/database';

const timestamp = '' + Date.now();

// Setup a new child database for the tests
let db: Database;
beforeAll(async () => {
	db = await Database.create(adminSecret, `fauna-upload-test-${timestamp}`);
});
afterAll(async () => {
	return db.destroy(adminSecret);
});

test("get database name", async () => { // {{{

	expect(db.getName()).toBe(`fauna-upload-test-${timestamp}`);

}); // }}}

test("create a collection", async () => { // {{{

	// Action
	await db.createCollection('my_collection');

	// Tests
	await expect(db.collectionExists('my_collection')).resolves.toBe(true);

}); // }}}

test("create an index", async () => { // {{{

	// Action
	await db.createIndex('my_collection', 'my_index', { terms: [{ field: ['data', 'my_prop'] }] });

	// Tests
	await expect(db.indexExists('my_index')).resolves.toBe(true);

}); // }}}

test("create a document", async () => { // {{{

	// Action
	await db.createDocument('my_collection', { my_prop: 'my_value' });

	// Tests
	await expect(db.documentExists('my_index', 'my_value')).resolves.toBe(true);

}); // }}}
