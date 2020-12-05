"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResources = void 0;
const faunadb_1 = require("faunadb");
const types_1 = require("../types");
async function uploadResources(client, resources, type) {
    const resourceIsData = type === types_1.ResourceType.Data;
    const [INDEX, CREATE] = (() => {
        switch (type) {
            case types_1.ResourceType.Data: return [faunadb_1.query.Index, faunadb_1.query.Create];
            case types_1.ResourceType.Role: return [faunadb_1.query.Role, faunadb_1.query.CreateRole];
            case types_1.ResourceType.Index: return [faunadb_1.query.Index, faunadb_1.query.CreateIndex];
            case types_1.ResourceType.Function: return [faunadb_1.query.Function, faunadb_1.query.CreateFunction];
            default: throw TypeError(`Unknown resource type '${type}'`);
        }
    })();
    const updateOrCreateResource = faunadb_1.query.If(faunadb_1.query.Exists(resourceIsData ? faunadb_1.query.Var('match') : INDEX(faunadb_1.query.Var('name'))), faunadb_1.query.Do(resourceIsData
        ? faunadb_1.query.Update(faunadb_1.query.Select(['ref'], faunadb_1.query.Get(faunadb_1.query.Var('match'))), { data: faunadb_1.query.Var('document') })
        : faunadb_1.query.Update(INDEX(faunadb_1.query.Var('name')), faunadb_1.query.Var('resource')), types_1.QueryResult.Updated), faunadb_1.query.Do(resourceIsData
        ? CREATE(faunadb_1.query.Var('collection'), { data: faunadb_1.query.Var('document') })
        : CREATE(faunadb_1.query.Var('resource')), types_1.QueryResult.Created));
    return await client.query(faunadb_1.query.Foreach(resources, faunadb_1.query.Lambda('resource', resourceIsData
        ? faunadb_1.query.Let({
            collection: faunadb_1.query.Select(['collection'], faunadb_1.query.Var('resource')),
            index: faunadb_1.query.Select(['index'], faunadb_1.query.Var('resource')),
            key: faunadb_1.query.Select(['key'], faunadb_1.query.Var('resource')),
        }, faunadb_1.query.Foreach(faunadb_1.query.Select(['data'], faunadb_1.query.Var('resource')), faunadb_1.query.Lambda('document', faunadb_1.query.Let({
            match: faunadb_1.query.Match(faunadb_1.query.Var('index'), faunadb_1.query.Select([faunadb_1.query.Var('key')], faunadb_1.query.Var('document')))
        }, updateOrCreateResource))))
        : faunadb_1.query.Let({
            name: faunadb_1.query.Select(['name'], faunadb_1.query.Var('resource')),
        }, updateOrCreateResource))));
}
exports.uploadResources = uploadResources;
