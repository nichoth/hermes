"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.handler = void 0;
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var faunadb_1 = require("faunadb");
var json_stable_stringify_1 = require("json-stable-stringify");
var ucans = require("ucans");
var util_js_1 = require("../../../src/util.js");
var q = faunadb_1["default"].query;
var client = new faunadb_1["default"].Client({
    secret: process.env.FAUNADB_SERVER_SECRET || ''
});
// a request is like
// { ucan, value: { signature, username, author, rootDID, hashedUsername,
//   timestamp } }
// `author` is the DID from the device that is writing the message
// `username` is the new human-readable username
// `hashedUsername` -- the hash of the `rootDID` -- this is unique per account
var handler = function hanlder(ev) {
    return __awaiter(this, void 0, void 0, function () {
        var author, username, hashedUsername, signature, ucan, value, timestamp, rootDID, body, result, isOk, pubKey, err_1, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ev.httpMethod !== 'POST') {
                        return [2 /*return*/, {
                                statusCode: 405,
                                body: JSON.stringify('invalid http method')
                            }];
                    }
                    try {
                        body = JSON.parse(ev.body);
                        (value = body.value, ucan = body.ucan, signature = body.signature);
                        (author = value.author, rootDID = value.rootDID, username = value.username, hashedUsername = value.hashedUsername, timestamp = value.timestamp);
                    }
                    catch (err) {
                        return [2 /*return*/, {
                                statusCode: 422,
                                body: 'invalid JSON'
                            }];
                    }
                    if (!author || !username || !hashedUsername || !rootDID || !timestamp) {
                        return [2 /*return*/, {
                                statusCode: 400,
                                body: JSON.stringify('invalid request params')
                            }];
                    }
                    return [4 /*yield*/, ucans.verify(ucan, {
                            audience: author,
                            requiredCapabilities: [
                                {
                                    capability: {
                                        "with": { scheme: 'my', hierPart: '*' },
                                        can: '*'
                                    },
                                    rootIssuer: rootDID
                                }
                            ]
                        })
                        //
                        // check the signature
                        //
                    ];
                case 1:
                    result = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    pubKey = (0, util_js_1.didToPublicKey)(author).publicKey;
                    return [4 /*yield*/, (0, util_js_1.verify)(pubKey, signature, (0, json_stable_stringify_1["default"])(value))];
                case 3:
                    isOk = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    return [2 /*return*/, {
                            statusCode: 400,
                            body: JSON.stringify(err_1.message)
                        }];
                case 5:
                    if (!isOk) {
                        return [2 /*return*/, {
                                statusCode: 400,
                                body: JSON.stringify('Invalid signature')
                            }];
                    }
                    return [4 /*yield*/, client.query(q.Let({
                            match: q.Match(q.Index('username-by-hash'), hashedUsername)
                        }, q.If(q.Exists(q.Var('match')), q.Update(q.Select('ref', q.Get(q.Var('match'))), { data: {
                                username: username,
                                hashedUsername: hashedUsername,
                                timestamp: timestamp,
                                rootDID: rootDID
                            } }), { type: 404, message: 'not found' })))
                        // if we can't find the given hashed username,
                        // it means there is no `username` record for the given id
                    ];
                case 6:
                    doc = _a.sent();
                    // if we can't find the given hashed username,
                    // it means there is no `username` record for the given id
                    if (doc.type && doc.type === 404) {
                        return [2 /*return*/, {
                                statusCode: 404,
                                body: JSON.stringify(doc.message)
                            }];
                    }
                    // everything went ok
                    // we updated a record with a new username
                    return [2 /*return*/, {
                            statusCode: 200,
                            body: JSON.stringify(doc)
                        }];
            }
        });
    });
};
exports.handler = handler;
