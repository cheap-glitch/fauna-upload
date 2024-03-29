import 'jest-extended';
import { query as q } from 'faunadb';

import { Database } from './helpers/database';

declare const db: Database;
declare const timestamp: string;

test('get database name', async () => { // {{{

	expect(db.getName()).toBe(`fauna-upload-test-${timestamp}`);

}); // }}}

test('get database secret', async () => { // {{{

	expect(db.getSecret()).toBeString();

}); // }}}

test('create a collection', async () => { // {{{

	// Action
	await db.createCollection('my_collection');

	// Tests
	await expect(db.collectionExists('my_collection')).resolves.toBe(true);

}); // }}}

test('create an index', async () => { // {{{

	// Action
	await db.createIndex('my_collection', 'my_index', { terms: [{ field: ['data', 'my_prop'] }] });

	// Tests
	await expect(db.indexExists('my_index')).resolves.toBe(true);

}); // }}}

test('create a document', async () => { // {{{

	// Action
	await db.createDocument('my_collection', { my_prop: 'my_value' });

	// Tests
	await expect(db.documentExists('my_index', 'my_value')).resolves.toBe(true);

}); // }}}

test('create a function', async () => { // {{{

	// Action
	await db.createFunction('my_function', q.Query(q.Lambda([], 'お早う, 世界!')));

	// Tests
	await expect(db.functionExists('my_function')).resolves.toBe(true);
	await expect(db.callFunction('my_function')).resolves.toBe('お早う, 世界!');

}); // }}}
