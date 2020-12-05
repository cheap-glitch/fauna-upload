export interface Resource {
	name: string
}

export enum ResourceType {
	Data,
	Role,
	Index,
	Function,
}

export enum QueryResult {
	Created = 'created',
	Updated = 'updated',
}
