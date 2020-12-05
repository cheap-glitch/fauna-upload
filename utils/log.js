"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.failure = exports.success = exports.info = void 0;
const chalk_1 = __importDefault(require("chalk"));
function info(message) { console.info(chalk_1.default.blue(message)); }
exports.info = info;
function success(message) { console.log(chalk_1.default.green(message)); }
exports.success = success;
function failure(message) { console.error(chalk_1.default.red(message)); }
exports.failure = failure;
