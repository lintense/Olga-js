// Generated automatically by nearley, version undefined
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

export default class MiniSort {

    constructor(funcDict) {
        this.funcDict = funcDict
        this.grammar = {
            Lexer: undefined,
            ParserRules: [
                { "name": "exp", "symbols": ["sort"], "postprocess": id },
                { "name": "exp", "symbols": ["filter"], "postprocess": id },
                {
                    "name": "filter", "symbols": ["expression", "_", "filterComparator", "_", "expression"], "postprocess":
                        ([left, , comp, , right]) => ({
                            "isFilter": true,
                            "left": left,
                            "comparator": comp,
                            "right": right
                        })
                },
                { "name": "sort", "symbols": ["sortComparator", "_", "expression"], "postprocess": ([c, , e]) => ({ "isSort": true, "comparator": c, "expression": e }) },
                {
                    "name": "expression", "symbols": ["expression", /[+]/, "term"], "postprocess":
                        ([left, op, right]) => ({ "op": op, "left": left, "right": right })
                },
                { "name": "expression", "symbols": ["term"], "postprocess": id },
                {
                    "name": "term", "symbols": ["term", /[*]/, "factor"], "postprocess":
                        ([left, op, right]) => ({ "op": op[0], "left": left, "right": right })
                },
                { "name": "term", "symbols": ["factor"], "postprocess": id },
                { "name": "factor", "symbols": [{ "literal": "(", "pos": 90 }, "expression", { "literal": ")", "pos": 94 }], "postprocess": ([, expr,]) => expr },
                { "name": "factor", "symbols": ["name"], "postprocess": id },
                { "name": "factor", "symbols": ["boolean"], "postprocess": id },
                { "name": "factor", "symbols": ["number"], "postprocess": id },
                { "name": "number$ebnf$1", "symbols": [/[0-9]/] },
                { "name": "number$ebnf$1", "symbols": [/[0-9]/, "number$ebnf$1"], "postprocess": function arrconcat(d) { return [d[0]].concat(d[1]); } },
                { "name": "number$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/] },
                { "name": "number$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/, "number$ebnf$2$subexpression$1$ebnf$1"], "postprocess": function arrconcat(d) { return [d[0]].concat(d[1]); } },
                { "name": "number$ebnf$2$subexpression$1", "symbols": [{ "literal": ".", "pos": 126 }, "number$ebnf$2$subexpression$1$ebnf$1"] },
                { "name": "number$ebnf$2", "symbols": ["number$ebnf$2$subexpression$1"], "postprocess": id },
                { "name": "number$ebnf$2", "symbols": [], "postprocess": function (d) { return null; } },
                {
                    "name": "number", "symbols": ["number$ebnf$1", "number$ebnf$2"], "postprocess":
                        ([intPart, fracPart]) => {
                            const numStr = intPart.join("") + (fracPart ? "." + fracPart[1].join("") : "");
                            return parseFloat(numStr);
                        }
                },
                { "name": "boolean$string$1", "symbols": [{ "literal": "t" }, { "literal": "r" }, { "literal": "u" }, { "literal": "e" }], "postprocess": function joiner(d) { return d.join(''); } },
                { "name": "boolean", "symbols": ["boolean$string$1"], "postprocess": () => true },
                { "name": "boolean$string$2", "symbols": [{ "literal": "f" }, { "literal": "a" }, { "literal": "l" }, { "literal": "s" }, { "literal": "e" }], "postprocess": function joiner(d) { return d.join(''); } },
                { "name": "boolean", "symbols": ["boolean$string$2"], "postprocess": () => false },
                { "name": "boolean$string$3", "symbols": [{ "literal": "n" }, { "literal": "u" }, { "literal": "l" }, { "literal": "l" }], "postprocess": function joiner(d) { return d.join(''); } },
                { "name": "boolean", "symbols": ["boolean$string$3"], "postprocess": () => null },
                { "name": "name$ebnf$1", "symbols": [] },
                { "name": "name$ebnf$1", "symbols": [/[a-zA-Z_]/, "name$ebnf$1"], "postprocess": function arrconcat(d) { return [d[0]].concat(d[1]); } },
                { "name": "name", "symbols": [/[A-Z]/, "name$ebnf$1"], "postprocess": ([h, t]) => (!t ? h : h + t.join("")) },
                { "name": "sortComparator", "symbols": [{ "literal": "<", "pos": 170 }], "postprocess": id },
                { "name": "sortComparator", "symbols": [{ "literal": ">", "pos": 176 }], "postprocess": id },
                { "name": "filterComparator$string$1", "symbols": [{ "literal": "<" }, { "literal": "=" }], "postprocess": function joiner(d) { return d.join(''); } },
                { "name": "filterComparator", "symbols": ["filterComparator$string$1"], "postprocess": id },
                { "name": "filterComparator", "symbols": [{ "literal": "<", "pos": 190 }], "postprocess": id },
                { "name": "filterComparator$string$2", "symbols": [{ "literal": ">" }, { "literal": "=" }], "postprocess": function joiner(d) { return d.join(''); } },
                { "name": "filterComparator", "symbols": ["filterComparator$string$2"], "postprocess": id },
                { "name": "filterComparator", "symbols": [{ "literal": ">", "pos": 202 }], "postprocess": id },
                { "name": "filterComparator$string$3", "symbols": [{ "literal": "!" }, { "literal": "=" }], "postprocess": function joiner(d) { return d.join(''); } },
                { "name": "filterComparator", "symbols": ["filterComparator$string$3"], "postprocess": () => "!=" },
                { "name": "filterComparator", "symbols": [{ "literal": "=", "pos": 214 }], "postprocess": id },
                { "name": "_$ebnf$1", "symbols": [] },
                { "name": "_$ebnf$1", "symbols": [{ "literal": " ", "pos": 222 }, "_$ebnf$1"], "postprocess": function arrconcat(d) { return [d[0]].concat(d[1]); } },
                { "name": "_", "symbols": ["_$ebnf$1"] }
            ]
            , ParserStart: "exp"
        }
        this.opMap = {}
        "< <= > >= = !=".split(" ").forEach((op, i) => this.opMap[op] = i)
        Object.freeze(this)
    }
    process(instanceArray, expArray) {

        const parsedArray = expArray.map(exp => {
            const parser = new nearley.Parser(this.grammar.ParserRules, "exp")
            parser.feed(exp.trim())
            const result = parser.results[0]
            result || console.warn(`invalid expression: "${exp}"`)
            return result
        })

        let filteredArray = instanceArray.filter(instance => parsedArray.every(exp => !exp || exp.isSort || this.processFilter(exp, instance)))
        if (!filteredArray.length) {
            console.warn("empty filteredArray")
            filteredArray = parsedArray // If nothing keep everything!
        }

        let sortedArray = filteredArray.sort((a, b) =>
            parsedArray.reduce((result, exp, i) => result != 0
                ? result
                : ((exp && exp.isSort)
                    ? this.processSort(exp, a, b)
                    : 0), 0))

        return sortedArray[0]
    }
    processSort({ comparator, expression }, left, right) {
        const leftVal = this.processExp(expression, left)
        const rightValue = this.processExp(expression, right)
        switch (this.opMap[comparator]) {
            case 0: // <
                return leftVal - rightValue
            case 2: // >
                return rightValue - leftVal
            default:
                console.error("invalid comparator")
        }
    }
    processFilter({ left, comparator, right }, instance) {
        const leftVal = this.processExp(left, instance)
        const rightValue = this.processExp(right, instance)
        switch (this.opMap[comparator]) {
            case 0: // <
                return leftVal < rightValue
            case 1: // <=
                return leftVal <= rightValue
            case 2: // >
                return leftVal > rightValue
            case 3: // >=
                return leftVal >= rightValue
            case 4: // =
                return leftVal == rightValue
            case 5: // !=
                return leftVal != rightValue
            default:
                console.error("unknown comparator")
        }

    }
    processExp(obj, instance) {
        if (Number.isFinite(obj))
            return obj
        else if (typeof obj === "string" || obj instanceof String)
            return this.funcDict[obj](instance)
        else if (typeof obj === "boolean" || obj instanceof Boolean)
            return obj
        else if (obj.op == "+") {
            const { left, op, right } = obj
            return this.processExp(left, instance) + this.processExp(right, instance)
        } else if (obj.op == "*") {
            const { left, op, right } = obj
            return this.processExp(left, instance) * this.processExp(right, instance)
        }
        console.error("unknown object")
    }
    static test() {
        let result
        const data = [{ id: 1, x: 100, y: 100, z: 600, t: true }, { id: 2, x: 200, y: 100, z: 500 }, { id: 3, x: 300, y: 100, z: 300 }, { id: 4, x: 400, y: 300, z: 100 }, { id: 5, x: 500, y: 200, z: 100 }, { id: 6, x: 600, y: 200, z: 100 },]
        const dict = { XXX: (d => d.x), YYY: (d => d.y), ZZZ: (d => d.z), TTT: (d => d.t) }

        const mini = new MiniSort(dict);

        [{ exp: [">ZZZ"], id: 1 },
        { exp: ["<ZZZ", ">YYY", ">XXX"], id: 4 },
        { exp: ["YYY =100", "<ZZZ"], id: 3 },
        { exp: ["<ZZZ", "YYY=100"], id: 3 },
        { exp: [">XXX+YYY*ZZZ", "",], id: 1 },
        { exp: [">XXX+YYY*ZZZ", "true != TTT",], id: 2 },
        { exp: ["XXX = ZZZ",], id: 3 },

        ].forEach(test => {
            console.log("testing: " + JSON.stringify(test))
            result = mini.process(data, test.exp)
            console.assert(result.id === test.id, "Failed test: result = " + result)
        })
    }
}





/* https://omrelli.ug/nearley-playground/
# This is the current syntax for the parser

exp -> sort  {% id %}
    | filter {% id %}

# Added a postprocessor to shape the filter object
filter -> expression _ filterComparator _ expression {% 
    ([left, , comp, , right]) => ({
        "isFilter": true,
        "left": left,
        "comparator": comp,
        "right": right
    }) 
%}

sort -> sortComparator _ expression {% ([c, ,e]) => ({ "isSort": true, "comparator": c, "expression": e }) %}

# 1. Low Precedence: Addition and Subtraction
expression -> expression [+] term {% 
    ([left, op, right]) => ({ "op": op, "left": left, "right": right }) 
%}
| term {% id %}

# 2. High Precedence: Multiplication and Division
term -> term [*] factor {% 
    ([left, op, right]) => ({ "op": op[0], "left": left, "right": right }) 
%}
| factor {% id %}

# 3. Base Atoms: Parentheses wrap the lowest level back to the top
factor -> "(" expression ")" {% ([,expr,]) => expr %}
        | name {% id %}
        | boolean {% id %}
        | number {% id %}

# Matches integers OR floats, and uses parseFloat
number -> [0-9]:+ ("." [0-9]:+):? {% 
    ([intPart, fracPart]) => {
        const numStr = intPart.join("") + (fracPart ? "." + fracPart[1].join("") : "");
        return parseFloat(numStr);
    }
%}

boolean -> "true" {% () => true %}
    | "false" {% () => false %}
    | "null" {% () => null %}

name -> [A-Z] [a-zA-Z_]:* {% ([h, t]) => (!t ? h : h + t.join("")) %}

sortComparator -> "<" {% id %}
            | ">"  {% id %}
filterComparator -> "<=" {% id %}
            | "<" {% id %}
            | ">=" {% id %}
            | ">"  {% id %}
            | "!="  {% () => "!=" %}
            | "="  {% id %}
        	
_ -> " ":*

*/