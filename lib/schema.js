"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSchema = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const log = __importStar(require("../utils/log"));
const utils_1 = require("../utils/utils");
const config_1 = require("../utils/config");
async function uploadSchema(schema, override = false, previews = []) {
    if (override) {
        log.info('Overriding GraphQL schema...');
    }
    else {
        log.info('Updating GraphQL schema...');
    }
    const res = await node_fetch_1.default('https://graphql.fauna.com/import' + (override ? '?mode=override' : ''), {
        body: schema,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config_1.secret}`,
            'Content-Type': 'text/plain',
            'X-Schema-Preview': previews.join(),
        },
    }).catch(log.failure);
    if (res === undefined) {
        return false;
    }
    if (!res.ok) {
        log.failure(await res.text());
        return false;
    }
    log.success('GraphQL schema updated');
    if (override) {
        log.info('Waiting for the data to be removed...');
        utils_1.wait(90 * 1000);
    }
    return true;
}
exports.uploadSchema = uploadSchema;
