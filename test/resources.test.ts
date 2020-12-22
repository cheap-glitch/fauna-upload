import { query as q } from 'faunadb';

import { Database } from './helpers/database';

import { uploadResources } from '../src/lib/resources';
import { FaunaResourceType, FaunaQueryResult } from '../src/types';

declare const db: Database;
// declare const timestamp: string;

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

test.todo("update an existing function");//, async () => { // {{{

// }); // }}}
