"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResult = exports.ResourceType = void 0;
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["Data"] = 0] = "Data";
    ResourceType[ResourceType["Role"] = 1] = "Role";
    ResourceType[ResourceType["Index"] = 2] = "Index";
    ResourceType[ResourceType["Function"] = 3] = "Function";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
var QueryResult;
(function (QueryResult) {
    QueryResult["Created"] = "created";
    QueryResult["Updated"] = "updated";
})(QueryResult = exports.QueryResult || (exports.QueryResult = {}));
