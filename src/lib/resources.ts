import { Client as FaunaClient, query as q } from 'faunadb';

import { Resource, ResourceType, QueryResult } from '../types';

export async function uploadResources(client: FaunaClient, resources: Resource, type: ResourceType): Promise<QueryResult> {
	const resourceIsData = type === ResourceType.Data;
	const [INDEX, CREATE] = (() => {
		switch (type) {
			case ResourceType.Data:     return [q.Index,    q.Create        ];
			case ResourceType.Role:     return [q.Role,     q.CreateRole    ];
			case ResourceType.Index:    return [q.Index,    q.CreateIndex   ];
			case ResourceType.Function: return [q.Function, q.CreateFunction];

			default: throw TypeError(`Unknown resource type '${type}'`);
		}
	})();

	// Update a resource/document if it already exists, otherwise create it
	const updateOrCreateResource = q.If(q.Exists(resourceIsData ? q.Var('match') : INDEX(q.Var('name'))),
		q.Do(
			resourceIsData
				? q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: q.Var('document') })
				: q.Update(INDEX(q.Var('name')), q.Var('resource')),

			QueryResult.Updated
		),
		q.Do(
			resourceIsData
				? CREATE(q.Var('collection'), { data: q.Var('document') })
				: CREATE(q.Var('resource')),

			QueryResult.Created
		)
	)

	return await client.query(q.Foreach(resources, q.Lambda('resource',
		resourceIsData
		? q.Let(
			{
				collection: q.Select(['collection'], q.Var('resource')),
				index:      q.Select(['index'],      q.Var('resource')),
				key:        q.Select(['key'],        q.Var('resource')),
			},
			q.Foreach(q.Select(['data'], q.Var('resource')), q.Lambda('document', q.Let(
				{
					match: q.Match(q.Var('index'), q.Select([q.Var('key')], q.Var('document')))
				},
				updateOrCreateResource
			)))
		)
		: q.Let(
			{
				name: q.Select(['name'], q.Var('resource')),
			},
			updateOrCreateResource
		)
	)));
}
