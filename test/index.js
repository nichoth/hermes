"use strict";
exports.__esModule = true;
// server side tests -- running in a node environment
var test = require("tape");
var username_js_1 = require("../netlify/functions/username/username.js");
test('set username', function (t) {
    // { value, ucan, signature }
    var ev = {
        httpMethod: 'POST',
        body: JSON.stringify({
            value: '',
            ucan: '',
            signature: ''
        })
    };
    (0, username_js_1.handler)(ev);
});
