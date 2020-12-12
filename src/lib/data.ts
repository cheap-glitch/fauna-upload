import { Client as FaunaClient, query as q } from 'faunadb';
import { FaunaDataCollection, FaunaQueryResult } from '../types';

export type FaunaDataUploadResults = Array<Array<FaunaQueryResult>>;

export async function uploadData(client: FaunaClient, resources: Array<FaunaDataCollection>): Promise<FaunaDataUploadResults | undefined> {
	// @TODO(1.1.0): add support for creating connections automatically
	const query = client.query(q.Map(resources, q.Lambda('resource', q.Let(
		{
			collection: q.Select(['collection'], q.Var('resource')),
			index:      q.Select(['index'],      q.Var('resource')),
			key:        q.Select(['key'],        q.Var('resource')),
		},
		q.Map(q.Select(['documents'], q.Var('resource')), q.Lambda('document', q.Let(
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

	let response;
	try {
		response = (await query) as FaunaDataUploadResults;
	} catch(error) {
		console.error(error);

		return undefined;
	}

	return response;
}
