import { Expr as FaunaExpression } from 'faunadb';

export enum FaunaResourceType {
	Role     = 'role',
	Index    = 'index',
	Function = 'function',
}

export type FaunaResource = FaunaRole | FaunaIndex | FaunaFunction;

export interface FaunaRole {
	name:         string
	privileges:   Array<FaunaPrivilege>
	memberships?: Array<FaunaMembership>
	data?:        Record<string, unknown>
}

interface FaunaPrivilege {
	resource:     FaunaExpression
	actions:      Partial<Record<FaunaActionName, boolean | FaunaExpression>>
}

type FaunaActionName = 'create' | 'delete' | 'read' | 'write' | 'history_read' | 'history_write' | 'unrestricted_read' | 'call';

interface FaunaMembership {
	resource:     FaunaExpression
	predicate?:   FaunaExpression
}

export interface FaunaIndex {
	name:         string
	source:       FaunaExpression | Array<FaunaSourceObject>
	terms?:       Array<FaunaTermObject>
	values?:      Array<FaunaValueObject>
	unique?:      boolean
	serialized?:  boolean
	permissions?: Record<string, unknown>
	data?:        Record<string, unknown>
}

interface FaunaSourceObject {
	collection:   FaunaExpression | '_'
	fields:       Record<string, FaunaExpression>
}

interface FaunaTermObject {
	field:        Array<string>
	binding:      string
}

interface FaunaValueObject {
	field:        Array<string>
	binding:      string
	reverse?:     boolean
}

export interface FaunaFunction {
	name:         string
	body:         FaunaExpression
	role?:        string | FaunaExpression
	data?:        Record<string, unknown>
}

export interface FaunaDataCollection {
	collection:   string
	index:        string
	key:          string
	documents:    Array<Record<string, unknown>>
}

export type FaunaUploadResults = Array<Array<FaunaQueryResult>>;

export enum FaunaQueryResult {
	Created = 'created',
	Updated = 'updated',
}
