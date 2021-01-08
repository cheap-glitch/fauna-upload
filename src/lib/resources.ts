import { Client as FaunaClient, query as q, errors as FaunaErrors } from 'faunadb';
import { FaunaResource, FaunaResourceType, FaunaQueryResult, FaunaUploadResults } from '../types';

export async function uploadResources(client: FaunaClient, type: FaunaResourceType, resources: Array<FaunaResource>): Promise<FaunaUploadResults | FaunaErrors.FaunaHTTPError> {
	const [INDEX, CREATE] = (() => {
		switch (type) {
			case FaunaResourceType.Role:     return [q.Role,     q.CreateRole];
			case FaunaResourceType.Index:    return [q.Index,    q.CreateIndex];
			case FaunaResourceType.Function: return [q.Function, q.CreateFunction];
		}
	})();

	const query = client.query(q.Map(resources, q.Lambda('resource', q.Let(
		{
			name: q.Select(['name'], q.Var('resource')),
		},
		q.If(q.Exists(INDEX(q.Var('name'))),
			q.Do(
				q.Update(INDEX(q.Var('name')), q.Var('resource')),
				FaunaQueryResult.Updated
			),
			q.Do(
				CREATE(q.Var('resource')),
				FaunaQueryResult.Created
			)
		)
	))));

	let response;
	try {
		response = await query;
	} catch(error) {
		return error;
	}

	return response as FaunaUploadResults;
}
