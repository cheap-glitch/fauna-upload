"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
async function wait(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}
exports.wait = wait;
