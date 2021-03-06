
var cobs = require('../');
    
function run(text, ws) {
    var program = cobs.compileProgram(text, ws);    
    program.procedure = program.compileFunction();
    var data = program.run(cobs.getRuntime());
    if (data)
        return data.working_storage;
    else
        return null;
};

exports['perform procedure'] = function (test) {
    var ws = { a: 1 };
    var newws = run('perform procedure1. procedure1 section. add 1 to a.', ws);
    test.equal(newws.a, 2);
};

exports['perform procedure with two commands'] = function (test) {
    var ws = { a: 1, b: 3 };
    var newws = run('perform procedure1. procedure1 section. add 1 to a. add 2 to b.', ws);
    test.equal(newws.a, 2);
    test.equal(newws.b, 5);
};

exports['perform two procedures'] = function (test) {
    var ws = { a: 1, b: 3 };
    var newws = run('perform procedure1. perform procedure2. procedure1 section. add 1 to a. procedure2 section. add 2 to b.', ws);
    test.equal(newws.a, 2);
    test.equal(newws.b, 5);
};

exports['perform procedure 10 times'] = function (test) {
    var ws = { k: null, a: 0 };
    var newws = run('perform procedure1 varying k from 1 to 4. procedure1 section. add k to a.', ws);
    test.equal(newws.a, 10);
    test.equal(newws.k, 5);
};

exports['perform procedure passing argument'] = function (test) {
    var ws = { a: 1, b: 3 };
    var newws = run('perform procedure1 using 3. procedure1 section using x. add x to a. add x to b.', ws);
    test.equal(newws.a, 4);
    test.equal(newws.b, 6);
};

exports['perform procedure 10 times passing argument'] = function (test) {
    var ws = { k: null, a: 0 };
    var newws = run('perform procedure1 using k varying k from 1 to 4. procedure1 section using x. add x to a.', ws);
    test.equal(newws.a, 10);
    test.equal(newws.k, 5);
};

exports['perform with giving and return'] = function (test) {
    var ws = { result: 0 };
    var newws = run('perform procedure1 using 3 giving result. procedure1 section using n. add 1 to n. return n.', ws);
    test.equal(newws.result, 4);
};

exports['perform factorial with auxiliary parameters'] = function (test) {
    var ws = { result: 0 };
    var newws = run('perform factorial using 3 giving result. factorial section using n. local m. if n = 1 then return n. subtract 1 from n giving m. perform factorial using m giving m. multiply n by m. return m.', ws);
    test.equal(newws.result, 6);
};

exports['perform global function'] = function (test) {
    var result = 1;
    global.foo = function() { result = 2; };

    var newws = run('global foo. perform foo.');
    test.equal(result, 2);
};

exports['invoke require'] = function (test) {
    global.foo = null;
    global.require = require;
    var assert = require('assert');

    var newws = run('global foo. global require. perform require using "assert" giving foo.');
    test.equal(global.foo, assert);
};

exports['perform function in global object'] = function (test) {
    var result = 1;
    global.foo = {
        setresult: function(n) { result = n; }
    };

    var newws = run('global foo. perform setresult in foo using 2.');
    test.equal(result, 2);
};

exports['perform Math cosine'] = function (test) {
    var ws = { result: null };
    var newws = run('perform cos in Math using 10 giving result.', ws);
    test.ok(newws.result);
    test.equal(newws.result, Math.cos(10));
};

exports['perform inline perform'] = function (test) {
    var ws = { result: null };
    var newws = run('local k. move 0 to result. perform varying k from 1 to 4 add k to result end-perform.', ws);
    test.ok(newws.result);
    test.equal(newws.result, 10);
};

exports['perform inline perform with exit perform'] = function (test) {
    var ws = { result: null };
    var newws = run('local k. move 0 to result. perform varying k from 1 to 4 add k to result if k >= 3 then exit perform end-perform.', ws);
    test.ok(newws.result);
    test.equal(newws.result, 6);
};

exports['perform inline perform setting array values'] = function (test) {
    var ws = { a: [1, 2, 3, 4] };
    var newws = run('local k. perform varying k from 1 to 4 add 1 to a(k) end-perform.', ws);
    test.ok(newws.a);
    test.equal(newws.a.toString(), '2,3,4,5');

    var ws = { a: [0, 0, 0, 0], b: [0, 0, 0, 0] };
    var newws = run('local k. perform varying k from 1 to 4 move k to a(k) b(k) end-perform.', ws);
    test.ok(newws.a);
    test.equal(newws.a.toString(), '1,2,3,4');
    test.ok(newws.b);
    test.equal(newws.b.toString(), '1,2,3,4');
};

