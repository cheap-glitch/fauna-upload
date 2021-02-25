import { Client as FaunaClient, query as q, errors as FaunaErrors } from 'faunadb';
import { FaunaDataCollection, FaunaQueryResult, FaunaUploadResults } from '../types';

export async function uploadDocuments(client: FaunaClient, collections: Array<FaunaDataCollection>): Promise<FaunaUploadResults | FaunaErrors.FaunaHTTPError> {
	const query = client.query(q.Map(collections, q.Lambda('collection', q.Let(
		{
			name:  q.Select(['collection'], q.Var('collection')),
			index: q.Select(['index'],      q.Var('collection')),
			key:   q.Select(['key'],        q.Var('collection')),
		},
		q.Map(q.Select(['documents'], q.Var('collection')), q.Lambda('document', q.Let(
			{
				match: q.Match(q.Var('index'), q.Select([q.Var('key')], q.Var('document'))),
			},
			q.If(q.Exists(q.Var('match')),
				q.Do(
					q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: q.Var('document') }),
					FaunaQueryResult.Updated
				),
				q.Do(
					q.Create(q.Var('name'), { data: q.Var('document') }),
					FaunaQueryResult.Created
				)
			)
		)))
	))));

	let response;
	try {
		response = await query;
	} catch(error) {
		return error;
	}

	return response as FaunaUploadResults;
}

