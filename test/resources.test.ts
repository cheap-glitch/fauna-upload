import { query as q } from 'faunadb';

import { Database } from './helpers/database';

import { uploadResources } from '../src/lib/resources';
import { FaunaResourceType, FaunaQueryResult } from '../src/types';

declare const db: Database;

test("create a new function", async () => { // {{{

	// Action
	const result = await uploadResources(db.getClient(), FaunaResourceType.Function, [{
		name: 'greet_person',
		body: q.Query(q.Lambda('name', q.Concat(['Hello, ', q.Var('name'), '!']))),
	}]);

	// Tests
	expect(result).toEqual([FaunaQueryResult.Created]);
	await expect(db.functionExists('greet_person')).resolves.toBe(true);
	await expect(db.callFunction('greet_person', 'Batman')).resolves.toBe('Hello, Batman!');

}); // }}}

test("update an existing function", async () => { // {{{

	// Setup
	if (!(await db.functionExists('greet_person'))) {
		await db.createFunction('greet_person', q.Query(q.Lambda('name', q.Concat(['Hello, ', q.Var('name'), '!']))));
	}

	// Action
	const result = await uploadResources(db.getClient(), FaunaResourceType.Function, [{
		name: 'greet_person',
		body: q.Query(q.Lambda('name', q.Concat(['Bonjour, ', q.Var('name'), '!']))),
	}]);

	// Tests
	expect(result).toEqual([FaunaQueryResult.Updated]);
	await expect(db.functionExists('greet_person')).resolves.toBe(true);
	await expect(db.callFunction('greet_person', 'Paul Éluard')).resolves.toBe('Bonjour, Paul Éluard!');

}); // }}}

test("create a new role", async () => { // {{{

	// Setup
	if (!(await db.collectionExists('my_collection'))) {
		await db.createCollection('my_collection');
	}

	// Action
	const result = await uploadResources(db.getClient(), FaunaResourceType.Role, [{
		name: 'my_role',
		privileges: [{
			resource: q.Collection('my_collection'),
			actions: {
				read:   true,
				create: true,
				delete: false,
			}
		}]
	}]);

	// Tests
	expect(result).toEqual([FaunaQueryResult.Created]);
	await expect(db.roleExists('my_role')).resolves.toBe(true);

}); // }}}

test("update an existing role", async () => { // {{{

	// Setup
	await expect(db.collectionExists('my_collection')).resolves.toBe(true);
	await expect(db.roleExists('my_role')).resolves.toBe(true);

	// Action
	const result = await uploadResources(db.getClient(), FaunaResourceType.Role, [{
		name: 'my_role',
		privileges: [{
			resource: q.Collection('my_collection'),
			actions: {
				read:   true,
				create: true,
				delete: true,
			}
		}]
	}]);

	// Tests
	expect(result).toEqual([FaunaQueryResult.Updated]);

}); // }}}
