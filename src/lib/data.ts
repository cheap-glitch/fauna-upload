import { Client as FaunaClient, query as q } from 'faunadb';
import FaunaResponse from 'faunadb/src/types/RequestResult';

import { FaunaDataCollection, FaunaQueryResult } from '../types';

export async function uploadData(client: FaunaClient, resources: Array<FaunaDataCollection>): Promise<FaunaResponse | undefined> {
	// @TODO(1.1.0): add support for creating connections automatically
	const query = client.query(q.Foreach(resources, q.Lambda('resource', q.Let(
		{
			collection: q.Select(['collection'], q.Var('resource')),
			index:      q.Select(['index'],      q.Var('resource')),
			key:        q.Select(['key'],        q.Var('resource')),
		},
		q.Foreach(q.Select(['documents'], q.Var('resource')), q.Lambda('document', q.Let(
			{
				match: q.Match(q.Var('index'), q.Select([q.Var('key')], q.Var('document')))
			},
			q.If(q.Exists(q.Var('match')),
				q.Do(
					q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: q.Var('document') }),
					FaunaQueryResult.Updated
				),
				q.Do(
					q.Create(q.Var('collection'), { data: q.Var('document') }),
					FaunaQueryResult.Created
				)
			)
		)))
	))));

	let reponse: FaunaResponse;
	try {
		reponse = (await query) as FaunaResponse;
	} catch(error) {
		console.error(error);

		return undefined;
	}

	return reponse;
}
