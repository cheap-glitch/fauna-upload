import { errors as FaunaErrors } from 'faunadb';

import { Database } from './helpers/database';

import { uploadDocuments } from '../src/lib/data';
import { FaunaQueryResult } from '../src/types';

declare const db: Database;
declare const timestamp: string;

test('upload new data', async () => { // {{{

	// Setup
	if (!(await db.collectionExists('users'))) {
		await db.createCollection('users');
	}
	if (!(await db.indexExists('users_keys'))) {
		await db.createIndex('users', 'users_keys', { unique: true, terms: [{ field: ['data', 'key'] }] });
	}

	// Action
	const result = await uploadDocuments(db.getClient(), [{
		collection: 'users',
		index:      'users_keys',
		key:        'key',
		documents:  [{ key: timestamp }],
	}]);

	// Tests
	expect(result).toEqual([[FaunaQueryResult.Created]]);

	await expect(db.documentExists('users_keys', timestamp)).resolves.toBe(true);

}); // }}}

test('update existing data', async () => { // {{{

	// Setup
	if (!(await db.collectionExists('users'))) {
		await db.createCollection('users');
	}
	if (!(await db.indexExists('users_keys'))) {
		await db.createIndex('users', 'users_keys', { unique: true, terms: [{ field: ['data', 'key'] }] });
	}
	if (!(await db.documentExists('users_keys', timestamp))) {
		await db.createDocument('users', { key: timestamp });
	}
	await expect(db.documentExists('users_keys', timestamp)).resolves.toBe(true);

	// Action
	const result = await uploadDocuments(db.getClient(), [{
		collection: 'users',
		index:      'users_keys',
		key:        'key',
		documents:  [{ key: timestamp, updated: true }],
	}]);

	// Tests
	expect(result).toEqual([[FaunaQueryResult.Updated]]);

	await expect(db.documentHasProperty('users_keys', timestamp, 'updated')).resolves.toBe(true);

}); // }}}

test('error while uploading data', async () => { // {{{

	// Action
	const result = await uploadDocuments(db.getClient(), [{
		collection: 'missing_collection',
		index:      'missing_index',
		key:        'key',
		documents:  [{ key: timestamp }],
	}]);

	// Tests
	expect(result).toBeInstanceOf(FaunaErrors.FaunaHTTPError);

}); // }}}
