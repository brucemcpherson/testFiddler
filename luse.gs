var LocalcUseful={"encodeB64":
function encodeB64(itemString) {
    return unPadB64(Utilities.base64EncodeWebSafe(itemString));
}
,"unPadB64":
function unPadB64(b64) {
    return b64 ? b64.split("=")[0] : b64;
}
,"timeFunction":
function timeFunction() {
    var timedResult = {start:new Date().getTime(), finish:undefined, result:undefined, elapsed:undefined};
    var args = Array.prototype.slice.call(arguments);
    var func = args.splice(0, 1)[0];
    timedResult.result = func.apply(func, args);
    timedResult.finish = new Date().getTime();
    timedResult.elapsed = timedResult.finish - timedResult.start;
    return timedResult;
}
,"traverseTree":
function traverseTree(parent, nodeFunction, getChildrenFunction, depth) {
    depth = depth || 0;
    if (parent) {
        nodeFunction(parent, depth++);
        (getChildrenFunction(parent) || []).forEach(function (d) {
            traverseTree(d, nodeFunction, getChildrenFunction, depth);
        });
    }
    return parent;
}
,"columnLabelMaker":
function columnLabelMaker(columnNumber, s) {
    s = String.fromCharCode(((columnNumber - 1) % 26) + "A".charCodeAt(0)) + (s || "");
    return columnNumber > 26 ? columnLabelMaker(Math.floor((columnNumber - 1) / 26), s) : s;
}
,"validateArgs":
function validateArgs(funcArgs, funcTypes, optFail) {
    var args = Array.isArray(funcArgs) ? funcArgs.slice(0) : (funcArgs ? [funcArgs] : []);
    var types = Array.isArray(funcTypes) ? funcTypes.slice(0) : (funcTypes ? [funcTypes] : []);
    var fail = applyDefault(optFail, true);
    if (args.length < types.length) {
        args = arrayAppend(args, new Array(types.length - args.length));
    }
    if (args.length !== types.length) {
        throw "validateArgs failed-number of args and number of types must match(" + args.length + ":" + types.length + ")" + JSON.stringify(whereAmI(0));
    }
    for (var i = 0, c = {ok:true}; i < types.length && c.ok; i++) {
        c = check(types[i], args[i], i);
    }
    return c;
    function check(expect, item, index) {
        var isOb = isObject(item);
        var got = typeof item;
        if ((isOb && expect === "object") || (got === expect)) {
            return {ok:true};
        }
        var cName = (isOb && item.constructor && item.constructor.name) ? item.constructor.name : "";
        if (cName === "Array") {
            if (expect.slice(0, cName.length) !== cName && expect.slice(0, 3) !== "any") {
                return report(expect, got, index, cName);
            }
            var match = new RegExp("\\.(\\w*)").exec(expect);
            var arrayType = match && match.length > 1 ? match[1] : "";
            if (!arrayType) {
                return {ok:true};
            }
            for (var i = 0, c = {ok:true}; i < item.length && c.ok; i++) {
                c = check(arrayType, item[i], index, i);
            }
            return c;
        } else {
            if (cName === expect || expect === "any") {
                return {ok:true};
            } else {
                return report(expect, got, index, cName);
            }
        }
    }
    function report(expect, got, index, name, elem) {
        var state = {ok:false, location:whereAmI(0), detail:{index:index, arrayElement:applyDefault(elem, -1), type:types[index], expected:expect, got:got}};
        Logger.log(JSON.stringify(state));
        if (fail) {
            throw JSON.stringify(state);
        }
        return state;
    }
}
,"b64ToString":
function b64ToString(b64) {
    return Utilities.newBlob(Utilities.base64Decode(b64)).getDataAsString();
}
,"padLeading":
function padLeading(stringtoPad, targetLength, padWith) {
    return (stringtoPad.length < targetLength ? Array(1 + targetLength - stringtoPad.length).join(padWith | "0") : "") + stringtoPad;
}
,"byteToHexString":
function byteToHexString(bytes) {
    return bytes.reduce(function (p, c) {
        return p += padLeading((c < 0 ? c + 256 : c).toString(16), 2);
    }, "");
}
,"makeSha1Hex":
function makeSha1Hex(content) {
    return byteToHexString(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, content));
}
,"replaceAll":
function replaceAll(inThisString, replaceThis, withThis) {
    return inThisString.replace(new RegExp(replaceThis, "g"), withThis);
}
,"extend":
function extend() {
    if (!arguments.length) {
        return undefined;
    }
    var extenders = [], targetOb;
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i]) {
            if (!isObject(arguments[i])) {
                throw "extend arguments must be objects not " + arguments[i];
            }
            if (i === 0) {
                targetOb = arguments[i];
            } else {
                extenders.push(arguments[i]);
            }
        }
    }
    extenders.forEach(function (d) {
        recurse(targetOb, d);
    });
    return targetOb;
    function recurse(tob, sob) {
        Object.keys(sob).forEach(function (k) {
            if (isUndefined(tob[k])) {
                tob[k] = sob[k];
            } else {
                if (isObject(sob[k])) {
                    recurse(tob[k], sob[k]);
                }
            }
        });
    }
}
,"whatAmI":
function whatAmI(ob) {
    try {
        if (ob !== Object(ob)) {
            return {type:typeof ob, value:ob, length:typeof ob === "string" ? ob.length : null};
        } else {
            try {
                var stringify = JSON.stringify(ob);
            }
            catch (err) {
                var stringify = "{\"result\":\"unable to stringify\"}";
            }
            return {type:typeof ob, value:stringify, name:ob.constructor ? ob.constructor.name : null, nargs:ob.constructor ? ob.constructor.arity : null, length:Array.isArray(ob) ? ob.length : null};
        }
    }
    catch (err) {
        return {type:"unable to figure out what I am"};
    }
}
,"whereAmI":
function whereAmI(level) {
    level = typeof level === "undefined" ? 1 : Math.abs(level);
    try {
        throw new Error();
    }
    catch (err) {
        var stack = err.stack.split("\n");
        if (!level) {
            return stack.slice(0, stack.length - 1).map(function (d) {
                return deComposeMatch(d);
            });
        } else {
            return deComposeMatch(stack[Math.min(level, stack.length - 1)]);
        }
    }
    function deComposeMatch(where) {
        var file = /at\s(.*):/.exec(where);
        var line = /:(\d*)/.exec(where);
        var caller = /:.*\((.*)\)/.exec(where);
        return {caller:caller ? caller[1] : "unknown", line:line ? line[1] : "unknown", file:file ? file[1] : "unknown"};
    }
}
,"showError":
function showError(err) {
    try {
        if (isObject(err)) {
            if (e.message) {
                return "Error message returned from Apps Script\n" + "message: " + e.message + "\n" + "fileName: " + e.fileName + "\n" + "line: " + e.lineNumber + "\n";
            } else {
                return JSON.stringify(err);
            }
        } else {
            return err.toString();
        }
    }
    catch (e) {
        return err;
    }
}
,"arrayRank":
function arrayRank(array, funcCompare, funcStoreRank, funcGetRank, optOriginalOrder) {
    funcCompare = funcCompare || function (a, b) {
        return a.value - b.value;
    };
    funcStoreRank = funcStoreRank || function (d, r, a) {
        d.rank = r;
        return d;
    };
    funcGetRank = funcGetRank || function (d) {
        return d.rank;
    };
    var sortable = optOriginalOrder ? array.map(function (d, i) {
        d._xlOrder = i;
        return d;
    }) : array;
    sortable.sort(function (a, b) {
        return funcCompare(a, b);
    }).forEach(function (d, i, arr) {
        funcStoreRank(d, i ? (funcCompare(d, arr[i - 1]) ? i : funcGetRank(arr[i - 1])) : i, arr);
    });
    if (optOriginalOrder) {
        sortable.forEach(function (d, i, a) {
            funcStoreRank(array[d._xlOrder], funcGetRank(d), a);
        });
    }
    return array;
}
,"getObjectsFromValues":
function getObjectsFromValues(values) {
    var obs = [];
    for (var i = 1; i < values.length; i++) {
        var k = 0;
        obs.push(values[i].reduce(function (p, c) {
            p[values[0][k++]] = c;
            return p;
        }, {}));
    }
    return obs;
}
,"escapeQuotes":
function escapeQuotes(s) {
    return (s + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
}
,"arrayAppend":
function arrayAppend(a, b) {
    if (b && b.length) {
        Array.prototype.push.apply(a, b);
    }
    return a;
}
,"errorStack":
function errorStack(e) {
    try {
        throw new Error();
    }
    catch (err) {
        return "Error:" + e + "\n" + err.stack.split("\n").slice(1).join("\n");
    }
}
,"rateLimitExpBackoff":
function rateLimitExpBackoff(callBack, sleepFor, maxAttempts, attempts, optLogAttempts, optChecker) {
    function errorQualifies(errorText) {
        return ["Exception: Service invoked too many times", "Exception: Rate Limit Exceeded", "Exception: Quota Error: User Rate Limit Exceeded", "Service error:", "Exception: Service error:", "Exception: User rate limit exceeded", "Exception: Internal error. Please try again.", "Exception: Cannot execute AddColumn because another task", "Service invoked too many times in a short time:", "Exception: Internal error.", "Exception: \u041f\u0440\u0435\u0432\u044b\u0448\u0435\u043d \u043b\u0438\u043c\u0438\u0442: DriveApp.", "User Rate Limit Exceeded", TRYAGAIN].some(function (e) {
            return errorText.toString().slice(0, e.length) == e;
        });
    }
    sleepFor = Math.abs(sleepFor || 750);
    attempts = Math.abs(attempts || 1);
    maxAttempts = Math.abs(maxAttempts || 5);
    if (optChecker && typeof (callBack) !== "function") {
        throw errorStack("if you specify a checker it must be a function");
    }
    if (!callBack || typeof (callBack) !== "function") {
        throw ("you need to specify a function for rateLimitBackoff to execute");
    } else {
        try {
            var r = callBack();
            return optChecker ? optChecker(r) : r;
        }
        catch (err) {
            if (optLogAttempts) {
                Logger.log("backoff " + attempts + ":" + err);
            }
            if (errorQualifies(err)) {
                if (attempts > maxAttempts) {
                    throw errorStack(err + " (tried backing off " + (attempts - 1) + " times");
                } else {
                    Utilities.sleep(Math.pow(2, attempts) * sleepFor + (Math.round(Math.random() * sleepFor)));
                    return rateLimitExpBackoff(callBack, sleepFor, maxAttempts, attempts + 1, optLogAttempts);
                }
            } else {
                throw errorStack(err);
            }
        }
    }
}
,"TRYAGAIN":"force backoff anyway","clone":
function clone(o) {
    return o ? JSON.parse(JSON.stringify(o)) : null;
}
,"isObject":
function isObject(obj) {
    return obj === Object(obj);
}
,"checksum":
function checksum(o) {
    var c = 23;
    if (!isUndefined(o)) {
        var s = (isObject(o) || Array.isArray(o)) ? JSON.stringify(o) : o.toString();
        for (var i = 0; i < s.length; i++) {
            c += (s.charCodeAt(i) * (i + 1));
        }
    }
    return c;
}
,"randBetween":
function randBetween(min, max) {
    return Utils.randBetween(min, max);
}
,"arbitraryString":
function arbitraryString(length) {
    return Utils.arbitraryString(length);
}
,"applyDefault":
function applyDefault(item, defaultValue) {
    return isUndefined(item) ? defaultValue : item;
}
,"isUndefined":
function isUndefined(item) {
    return typeof item === "undefined";
}
,"generateUniqueString":
function generateUniqueString(optAbcLength) {
    return Utils.generateUniqueString(optAbcLength);
}
,"getRandomSheetStrings":
function getRandomSheetStrings(rows, columns, min, max) {
    min = typeof min == typeof undefined ? 2 : min;
    max = typeof max == typeof undefined ? 20 : max;
    rows = typeof rows == typeof undefined ? 2 : rows;
    columns = typeof columns == typeof undefined ? 20 : columns;
    return new Array(rows).join(",").split(",").map(function () {
        return new Array(columns).join(",").split(",").map(function () {
            var size = Math.floor(Math.random() * (max - min + 1)) + min;
            return size ? new Array(size).join(",").split(",").map(function () {
                var s = String.fromCharCode(Math.floor(Math.random() * (126 - 48 + 1)) + 48);
                if (s.slice(0, 1) === "=") {
                    s = "x" + s.slice(1);
                }
                return s;
            }).join("") : "";
        });
    });
}
,"isEmail":
function isEmail(emailAddress) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailAddress);
}
,"isDateObject":
function isDateObject(ob) {
    return isObject(ob) && ob.constructor && ob.constructor.name === "Date";
}
,"getLibraryInfo":
function getLibraryInfo() {
    return {info:{name:"cUseful", version:"2.4.06", key:"Mcbr-v4SsYKJP7JMohttAZyz3TLx7pV4j", share:"https://script.google.com/d/1EbLSESpiGkI3PYmJqWh3-rmLkYKAtCNPi1L2YCtMgo2Ut8xMThfJ41Ex/edit?usp=sharing", description:"addedd Utils.curry"}};
}
,"showMyScriptAppResource":
function showMyScriptAppResource(s) {
    try {
        return ScriptApp.getResource(s);
    }
    catch (err) {
        throw err + " getting script " + s;
    }
}
,"Utils":{"expBackoff":
function (callBack, options, attempts) {
    options = options || {};
    optionsDefault = {sleepFor:750, maxAttempts:5, checker:errorQualifies, logAttempts:true};
    Object.keys(optionsDefault).forEach(function (k) {
        if (!options.hasOwnProperty(k)) {
            options[k] = optionsDefault[k];
        }
    });
    attempts = attempts || 1;
    if (typeof (options.checker) !== "function") {
        throw ns.errorStack("if you specify a checker it must be a function");
    }
    if (!callBack || typeof (callBack) !== "function") {
        throw ns.errorStack("you need to specify a function for rateLimitBackoff to execute");
    }
    function waitABit(theErr) {
        if (attempts > options.maxAttempts) {
            throw errorStack(theErr + " (tried backing off " + (attempts - 1) + " times");
        } else {
            Utilities.sleep(Math.pow(2, attempts) * options.sleepFor + Math.round(Math.random() * options.sleepFor));
        }
    }
    try {
        var response = callBack(options, attempts);
        if (options.lookahead && options.lookahead(response, attempts)) {
            if (options.logAttempts) {
                Logger.log("backoff lookahead:" + attempts);
            }
            waitABit("lookahead:");
            return ns.expBackoff(callBack, options, attempts + 1);
        }
        return response;
    }
    catch (err) {
        if (options.logAttempts) {
            Logger.log("backoff " + attempts + ":" + err);
        }
        if (options.checker(err)) {
            waitABit(err);
            return ns.expBackoff(callBack, options, attempts + 1);
        } else {
            throw ns.errorStack(err);
        }
    }
}
,"errorStack":
function (e) {
    try {
        throw new Error();
    }
    catch (err) {
        return "Error:" + e + "\n" + err.stack.split("\n").slice(1).join("\n");
    }
}
,"gaDate":
function (dt) {
    return Utilities.formatDate(dt, Session.getScriptTimeZone(), "yyyy-MM-dd");
}
,"getMatchPiece":
function (rx, source, def) {
    var f = rx.exec(source);
    var result = f && f.length > 1 ? f[1] : def;
    if (typeof def === typeof true) {
        result = ns.yesish(result);
    }
    return result;
}
,"generateUniqueString":
function (optAbcLength) {
    var abcLength = ns.isUndefined(optAbcLength) ? 3 : optAbcLength;
    return (new Date().getTime()).toString(36) + arbitraryString(abcLength);
}
,"arbitraryString":
function (length) {
    var s = "";
    for (var i = 0; i < length; i++) {
        s += String.fromCharCode(ns.randBetween(97, 122));
    }
    return s;
}
,"randBetween":
function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
,"yesish":
function (s) {
    var t = s.toString().toLowerCase();
    return t === "yes" || "y" || "true" || "1";
}
,"isUndefined":
function (value) {
    return typeof value === typeof undefined;
}
,"isObject":
function (obj) {
    return obj === Object(obj);
}
,"checksum":
function (o) {
    var c = 23;
    if (!ns.isUndefined(o)) {
        var s = (ns.isObject(o) || Array.isArray(o)) ? JSON.stringify(o) : o.toString();
        for (var i = 0; i < s.length; i++) {
            c += (s.charCodeAt(i) * (i + 1));
        }
    }
    return c;
}
,"keyDigest":
function () {
    return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, Array.prototype.slice.call(arguments).map(function (d) {
        return (Object(d) === d) ? JSON.stringify(d) : d.toString();
    }).join("-"), Utilities.Charset.UTF_8));
}
,"categorize":
function (var_arg) {
    var domain_ = Array.prototype.slice.call(arguments);
    var labels_ = domain_.map(function (d, i, a) {
        return (i ? ">= " + a[i - 1] + " " : "") + "< " + d;
    });
    labels_.push(domain_.length ? (">= " + domain_[domain_.length - 1]) : "all");
    function getCategory(value) {
        var index = 0;
        while (domain_[index] <= value) {
            index++;
        }
        return index;
    }
    return function (value) {
        return Object.create(null, {index:{get:function () {
            return getCategory(value);
        }}, label:{get:function () {
            return labels_[getCategory(value)];
        }}, labels:{get:function () {
            return labels_;
        }, set:function (newLabels) {
            if (domain_.length !== newLabels.length - 1) {
                throw "labels should be an array of length " + (domain_.length + 1);
            }
            labels_ = newLabels;
        }}, domain:{get:function () {
            return domain_;
        }}, toString:{value:function () {
            return this.label;
        }}});
    };
}
,"blobDigest":
function (blob) {
    return ns.keyDigest(Utilities.base64Encode(blob.getBytes()));
}
,"clone":
function (cloneThis) {
    return ns.vanExtend({}, cloneThis);
}
,"propify":
function (propertyScheme, base) {
    if (typeof base === typeof undefined) {
        base = {};
    }
    if (typeof base !== typeof {}) {
        throw "vanPropify:base needs to be an object";
    }
    (propertyScheme || "").split(".").reduce(function (p, c) {
        if (typeof p[c] === typeof undefined) {
            p[c] = {};
        }
        if (typeof p[c] !== typeof {}) {
            //throw "vanPropify:branch " + c + " not an object in " + propertyScheme;
        }
        return p[c];
    }, base);
    return base;
}
,"vanMerge":
function (obs) {
    return (obs || []).reduce(function (p, c) {
        return ns.vanExtend(p, c);
    }, {});
}
,"vanExtend":
function (result, opt) {
    result = result || {};
    opt = opt || {};
    return Object.keys(opt).reduce(function (p, c) {
        if (ns.isVanObject(opt[c])) {
            p[c] = ns.vanExtend(p[c], opt[c]);
        } else {
            p[c] = opt[c];
        }
        return p;
    }, result);
}
,"fixDef":
function (value, defValue) {
    return typeof value === typeof undefined ? defValue : value;
}
,"isVanObject":
function (value) {
    return typeof value === "object" && !Array.isArray(value);
}
,"crush":
function (crushThis) {
    return Utilities.base64Encode(Utilities.zip([Utilities.newBlob(JSON.stringify(crushThis))]).getBytes());
}
,"uncrush":
function (crushed) {
    return Utilities.unzip(Utilities.newBlob(Utilities.base64Decode(crushed), "application/zip"))[0].getDataAsString();
}
,"findTableBlocks":
function (values, options) {
    var MODES = {cells:"cells", position:"position"};
    options = ns.vanExtend({mode:MODES.cells, rank:0, rowTolerance:0, columnTolerance:0}, options);
    options.mode = options.mode.toLowerCase();
    if (!MODES[options.mode]) {
        throw "invalid mode " + options.mode + ":mode needs to be one of " + Object.keys(MODES).map(function (k) {
            return MODES[k];
        }).join(",");
    }
    if (!values || !Array.isArray(values) || !Array.isArray(values[0])) {
        throw "values must be an array of arrays as returned by getValues";
    }
    var fiddler = new Fiddler().setHasHeaders(false).setValues(values.slice());
    var headers = fiddler.getHeaders();
    var data = fiddler.getData();
    var blankRows = getBlankRows_();
    blankRows.push(fiddler.getNumRows());
    var blocks = blankRows.reduce(function (p, c) {
        var current = p[p.length - 1];
        current.size.rows = c - current.start.row;
        if (current.size.rows) {
            var columnFiddler = new Fiddler().setHasHeaders(false).setValues(values.slice(current.start.row, current.size.rows + current.start.row));
            var blankColumns = getBlankColumns_(columnFiddler);
            blankColumns.push(columnFiddler.getNumColumns());
        } else {
            blankColumns = [0];
        }
        blankColumns.forEach(function (d, i, a) {
            current.size.columns = d - current.start.column;
            if (i < a.length) {
                current = {start:{row:current.start.row, column:d + 1}, size:{rows:current.size.rows, columns:0}};
                p.push(current);
            }
        });
        var up = {start:{row:c + 1, column:0}, size:{rows:0, columns:0}};
        p.push(up);
        return p;
    }, [{start:{row:0, column:0}, size:{rows:0, columns:0}}]).filter(function (d) {
        return d.size.rows > 0 && d.size.columns > 0;
    }).map(function (d, i) {
        d.a1Notation = ns.columnLabelMaker(d.start.column + 1) + (d.start.row + 1) + ":" + ns.columnLabelMaker(d.start.column + d.size.columns) + (d.start.row + d.size.rows);
        d[MODES.cells] = d.size.columns * d.size.rows;
        d[MODES.position] = i;
        return d;
    }).sort(function (a, b) {
        return a[options.mode] - b[options.mode];
    });
    var selected = blocks[options.rank ? options.rank - 1 : blocks.length - 1];
    fiddler.filterRows(function (d, props) {
        return props.rowOffset >= selected.start.row && props.rowOffset < selected.start.row + selected.size.rows;
    }).filterColumns(function (d, props) {
        return props.columnOffset >= selected.start.column && props.columnOffset < selected.start.column + selected.size.columns;
    });
    return {blankRows:blankRows, blocks:blocks, selected:{block:selected, values:fiddler.createValues()}};
    function getBlankRows_() {
        return fiddler.getData().map(function (d, i) {
            return i;
        }).filter(function (p) {
            return Object.keys(data[p]).every(function (d) {
                return data[p][d] === "";
            });
        }).filter(function (d, i, a) {
            return a[i + options.rowTolerance] === d + options.rowTolerance || a.slice(0, i + 1).every(function (p, j) {
                return j === p;
            });
        });
    }
    function getBlankColumns_(fid) {
        var h = fid.getHeaders();
        return h.map(function (d, i) {
            return i;
        }).filter(function (p) {
            var uniqueValues = fid.getUniqueValues(headers[p]);
            return !uniqueValues.length || uniqueValues.length === 1 && uniqueValues[0] === "";
        }).filter(function (d, i, a) {
            return a[i + options.columnTolerance] === d + options.columnTolerance || a.slice(0, i + 1).every(function (p, j) {
                return j === p;
            });
        });
    }
}
,"curry":
function () {
    return curry.apply(null, Array.prototype.slice.call(arguments));
}
},"Fiddler":
function Fiddler(sheet) {
    var self = this;
    var values_, headerOb_, dataOb_ = [], hasHeaders_ = true, functions_, renameDups_ = true, renameBlanks_ = true, blankOffset_ = 0, sheet_ = null;
    var defaultFunctions_ = {compareFunc:function (a, b) {
        return a === b;
    }, filterRows:function (row, properties) {
        return true;
    }, filterColumns:function (heading, properties) {
        return true;
    }, mapRows:function (row, properties) {
        return row;
    }, mapColumns:function (values, properties) {
        return values;
    }, mapColumn:function (value, properties) {
        return value;
    }, mapHeaders:function (name, properties) {
        return name;
    }, selectRows:function (value, properties) {
        return true;
    }};
    functions_ = defaultFunctions_;
    self.setSheet = function (sheet) {
        sheet_ = sheet;
        return self;
    };
    self.getSheet = function (sheet) {
        return sheet_;
    };
    self.selectRows = function (name, func) {
        var values = self.getColumnValues(name);
        var columnIndex = self.getHeaders().indexOf(name);
        var result = [];
        values.forEach(function (d, i) {
            if ((checkAFunc(func) || functions_.selectRows)(d, {name:name, data:dataOb_, headers:headerOb_, rowOffset:i, columnOffset:columnIndex, fiddler:self, values:values, row:dataOb_[i]})) {
                result.push(i);
            }
        });
        return result;
    };
    self.mapRows = function (func) {
        dataOb_ = dataOb_.map(function (row, rowIndex) {
            var rowLength = Object.keys(row).length;
            var result = (checkAFunc(func) || functions_.mapRows)(row, {name:rowIndex, data:dataOb_, headers:headerOb_, rowOffset:rowIndex, columnOffset:0, fiddler:self, values:self.getHeaders().map(function (k) {
                return row[k];
            }), row:row});
            if (!result || typeof result !== "object") {
                throw new Error("you need to return the row object - did you forget?");
            }
            if (Object.keys(result).length !== rowLength) {
                throw new Error("you cant change the number of columns in a row during map items");
            }
            return result;
        });
        return self;
    };
    self.setRenameDups = function (rename) {
        renameDups_ = rename;
        return self;
    };
    self.setRenameBlanks = function (rename) {
        renameBlanks_ = rename;
        return self;
    };
    self.setBlankOffset = function (off) {
        blankOffset_ = off;
        return self;
    };
    self.getUniqueValues = function (columnName, compareFunc) {
        return self.getColumnValues(columnName).filter(function (d, i, a) {
            return axof_(d, a, compareFunc) === i;
        });
    };
    function axof_(value, arr, compareFunc) {
        var cf = checkAFunc(compareFunc) || functions_.compareFunc;
        for (var i = 0; i < arr.length; i++) {
            if (cf(value, arr[i])) {
                return i;
            }
        }
        return -1;
    }
    self.filterUnique = function (columnNames, keepLast, compareFunc) {
        var headers = self.getHeaders();
        cols = columnNames || headers;
        if (!Array.isArray(cols)) {
            cols = [cols];
        }
        var data = dataOb_.slice();
        if (cols.some(function (d) {
            return headers.indexOf(d) === -1;
        })) {
            throw "unknown columns in " + JSON.stringify(cols) + " compared to " + JSON.stringify(headers);
        }
        data = data.filter(function (d, i, a) {
            var soFar = keepLast ? a.slice(i + 1) : a.slice(0, i);
            return !soFar.some(function (e) {
                return cols.every(function (f) {
                    return (checkAFunc(compareFunc) || functions_.compareFunc)(d[f], e[f]);
                });
            });
        });
        dataOb_ = data;
        return self;
    };
    self.filterRows = function (func) {
        dataOb_ = dataOb_.filter(function (row, rowIndex) {
            return (checkAFunc(func) || functions_.filterRows)(row, {name:rowIndex, data:dataOb_, headers:headerOb_, rowOffset:rowIndex, columnOffset:0, fiddler:self, values:self.getHeaders().map(function (k) {
                return row[k];
            }), row:row});
        });
        return self;
    };
    self.sort = function (name, descending, auxFiddler) {
        if (self.getHeaders().indexOf(name) === -1) {
            throw new Error(name + " is not a valid header name");
        }
        return self.handySort(self.getData(), {values:auxFiddler ? auxFiddler.getData() : null, descending:descending, extractFunction:function (values, a) {
            return values[a][name];
        }});
    };
    self.sortFiddler = function (name, descending, auxFiddler) {
        var data = self.sort(name, descending, auxFiddler);
        self.setData(data);
        return self;
    };
    self.handySort = function (displayValues, options) {
        options = options || {};
        var descending = options.descending || false;
        var defaultExtract = function (values, a) {
            return values[a];
        };
        var extractFunc = options.extractFunction || defaultExtract;
        var compareFunc = options.compareFunc || function (a, b) {
            return a > b ? 1 : (a === b ? 0 : -1);
        };
        var values = options.values || displayValues;
        if (displayValues.length !== values.length) {
            throw "value arrays need to be same length";
        }
        return displayValues.map(function (d, i) {
            return i;
        }).sort(function (a, b) {
            return compareFunc(extractFunc(values, descending ? b : a), extractFunc(values, descending ? a : b));
        }).map(function (d) {
            return displayValues[d];
        });
    };
    self.mapColumn = function (name, func) {
        var values = self.getColumnValues(name);
        var columnIndex = self.getHeaders().indexOf(name);
        values.forEach(function (value, rowIndex) {
            dataOb_[rowIndex][name] = (checkAFunc(func) || functions_.mapColumns)(value, {name:name, data:dataOb_, headers:headerOb_, rowOffset:rowIndex, columnOffset:columnIndex, fiddler:self, values:values, row:dataOb_[rowIndex]});
        });
        return self;
    };
    self.mapColumns = function (func) {
        var columnWise = columnWise_();
        var oKeys = Object.keys(columnWise);
        oKeys.forEach(function (key, columnIndex) {
            var hold = columnWise[key].slice();
            var result = (checkAFunc(func) || functions_.mapColumns)(columnWise[key], {name:key, data:dataOb_, headers:headerOb_, rowOffset:0, columnOffset:columnIndex, fiddler:self, values:columnWise[key]});
            if (!result || result.length !== hold.length) {
                throw new Error("you cant change the number of rows in a column during map items");
            }
            if (hold.join() !== result.join()) {
                result.forEach(function (r, i) {
                    dataOb_[i][key] = r;
                });
            }
        });
        return self;
    };
    self.mapHeaders = function (func) {
        if (!self.hasHeaders()) {
            throw new Error("this fiddler has no headers so you cant change them");
        }
        var columnWise = columnWise_();
        var oKeys = Object.keys(columnWise);
        var nKeys = [];
        oKeys.forEach(function (key, columnIndex) {
            var result = (checkAFunc(func) || functions_.mapHeaders)(key, {name:key, data:dataOb_, headers:headerOb_, rowOffset:0, columnOffset:columnIndex, fiddler:self, values:columnWise[key]});
            if (!result) {
                throw new Error("header cant be blank");
            }
            nKeys.push(result);
        });
        if (nKeys.join() !== oKeys.join()) {
            headerOb_ = {};
            dataOb_ = dataOb_.map(function (d) {
                return oKeys.reduce(function (p, c) {
                    var idx = Object.keys(p).length;
                    headerOb_[nKeys[idx]] = idx;
                    p[nKeys[idx]] = d[c];
                    return p;
                }, {});
            });
        }
        return self;
    };
    self.filterColumns = function (func) {
        checkAFunc(func);
        var columnWise = columnWise_();
        var oKeys = Object.keys(columnWise);
        var nKeys = oKeys.filter(function (key, columnIndex) {
            var result = (checkAFunc(func) || functions_.filterColumns)(key, {name:key, data:dataOb_, headers:headerOb_, rowOffset:0, columnOffset:columnIndex, fiddler:self, values:self.getColumnValues(key)});
            return result;
        });
        if (nKeys.length !== oKeys.length) {
            dataOb_ = dropColumns_(nKeys);
            headerOb_ = nKeys.reduce(function (p, c) {
                p[c] = Object.keys(p).length;
                return p;
            }, {});
        }
        return self;
    };
    self.getColumnValues = function (columnName) {
        if (self.getHeaders().indexOf(columnName) === -1) {
            throw new Error(columnName + " is not a valid header name");
        }
        return dataOb_.map(function (d) {
            return d[columnName];
        });
    };
    self.getRowValues = function (rowOffset) {
        return headOb_.map(function (key) {
            return d[rowOffset][headOb_[key]];
        });
    };
    self.copyColumn = function (header, newHeader, insertBefore) {
        var headers = self.getHeaders();
        var headerPosition = headers.indexOf(header);
        if (!header || headerPosition === -1) {
            throw new Error("must supply an existing header of column to move");
        }
        var columnOffset = insertColumn_(newHeader, insertBefore);
        self.mapColumns(function (values, properties) {
            return properties.name === newHeader ? self.getColumnValues(header) : values;
        });
        return self;
    };
    self.populate = function (sheet) {
        self.setSheet(sheet);
        var range = sheet.getDataRange();
        return self.setValues(range.getValues());
    };
    self.dumpValues = function (sheet) {
        var range = (sheet || sheet_).getDataRange();
        range.clearContent();
        if (self.getData().length) {
            self.getRange(range).setValues(self.createValues());
        }
        return self;
    };
    self.getRange = function (range) {
        if (!range && !sheet_) {
            throw "must set a default sheet or specify a range";
        }
        range = range || sheet_.getDataRange();
        return range.offset(0, 0, self.getNumRows() + (self.hasHeaders() ? 1 : 0), self.getNumColumns());
    };
    self.moveColumn = function (header, insertBefore) {
        var headers = self.getHeaders();
        var headerPosition = headers.indexOf(header);
        if (!header || headerPosition === -1) {
            throw new Error("must supply an existing header of column to move");
        }
        headers.splice(headerPosition, 1);
        var columnOffset = insertBefore ? headers.indexOf(insertBefore) : self.getNumColumns();
        if (columnOffset < 0 || columnOffset > self.getNumColumns()) {
            throw new Error(header + " doesnt exist to insert before");
        }
        headers.splice(columnOffset, 0, header);
        headerOb_ = headers.reduce(function (p, c) {
            p[c] = Object.keys(p).length;
            return p;
        }, {});
        return self;
    };
    function insertColumn_(header, insertBefore) {
        var headers = self.getHeaders();
        var columnOffset = insertBefore ? headers.indexOf(insertBefore) : self.getNumColumns();
        if (!self.hasHeaders() && header) {
            throw new Error("this fiddler has no headers - you cant insert a column with a header");
        }
        if (!self.hasHeaders()) {
            header = columnLabelMaker_(headers.length + 1);
        }
        if (!header) {
            throw new Error("must supply a header for an inserted column");
        }
        if (headers.indexOf(header) !== -1) {
            throw new Error("you cant insert a duplicate header " + header);
        }
        if (columnOffset < 0 || columnOffset > self.getNumColumns()) {
            throw new Error(header + " doesnt exist to insert before");
        }
        headers.splice(columnOffset, 0, header);
        headerOb_ = headers.reduce(function (p, c) {
            p[c] = Object.keys(p).length;
            return p;
        }, {});
        dataOb_.forEach(function (d) {
            d[header] = "";
        });
        return columnOffset;
    }
    self.insertColumn = function (header, insertBefore) {
        insertColumn_(header, insertBefore);
        return self;
    };
    self.insertRows = function (rowOffset, numberOfRows, data) {
        if (typeof numberOfRows === typeof undefined) {
            numberOfRows = 1;
        }
        if (typeof rowOffset === typeof undefined) {
            rowOffset = self.getNumRows();
        }
        if (rowOffset < 0 || rowOffset > self.getNumRows()) {
            throw new Error(rowOffset + " is inalid row to insert before");
        }
        for (var i = 0, skeleton = [], apply = [rowOffset, 0]; i < numberOfRows; i++) {
            skeleton.push(makeEmptyObject_());
        }
        if (data) {
            if (!Array.isArray(data)) {
                data = [data];
            }
            if (data.length !== skeleton.length) {
                throw new Error("number of data items " + data.length + " should equal number of rows " + skeleton.length + " to insert ");
            }
            skeleton.forEach(function (e, i) {
                Object.keys(e).forEach(function (key) {
                    if (data[i].hasOwnProperty(key)) {
                        e[key] = data[i][key];
                    }
                });
                if (Object.keys(data[i]).some(function (d) {
                    return !e.hasOwnProperty(d);
                })) {
                    throw new Error("unknown columns in row data to insert:" + JSON.stringify(Object.keys(data[i])));
                }
            });
        }
        dataOb_.splice.apply(dataOb_, apply.concat(skeleton));
        return self;
    };
    function makeEmptyObject_() {
        return self.getHeaders().reduce(function (p, c) {
            p[c] = "";
            return p;
        }, {});
    }
    function columnWise_() {
        return Object.keys(headerOb_).reduce(function (tob, key) {
            tob[key] = self.getColumnValues(key);
            return tob;
        }, {});
    }
    function dropColumns_(newKeys) {
        return dataOb_.map(function (row) {
            return Object.keys(row).filter(function (key) {
                return newKeys.indexOf(key) !== -1;
            }).reduce(function (p, c) {
                p[c] = row[c];
                return p;
            }, {});
        });
    }
    self.getNumRows = function () {
        return dataOb_.length;
    };
    self.getNumColumns = function () {
        return Object.keys(headerOb_).length;
    };
    function checkAFunc(func) {
        if (func && typeof func !== "function") {
            throw new Error("argument should be a function");
        }
        return func;
    }
    function makeColItem_(ob, key, idx) {
        return {values:ob[key], columnOffset:idx, name:key};
    }
    function makeRowItem_(row, idx) {
        return {values:Object.keys(headerOb_).map(function (k) {
            return row[k];
        }), rowOffset:idx, data:row, fiddler:self};
    }
    self.getHeaders = function () {
        return Object.keys(headerOb_);
    };
    self.getData = function () {
        return dataOb_;
    };
    self.setData = function (dataOb) {
        headerOb_ = (dataOb || []).reduce(function (hob, row) {
            Object.keys(row).forEach(function (key) {
                if (!hob.hasOwnProperty(key)) {
                    hob[key] = Object.keys(hob).length;
                }
            });
            return hob;
        }, {});
        dataOb_ = dataOb;
        return self;
    };
    self.init = function () {
        if (values_) {
            headerOb_ = makeHeaderOb_();
            dataOb_ = makeDataOb_();
        } else {
            headerOb_ = dataOb_ = null;
        }
        return self;
    };
    self.hasHeaders = function () {
        return hasHeaders_;
    };
    self.setHasHeaders = function (headers) {
        hasHeaders_ = !!headers;
        return self.init();
    };
    self.setValues = function (values) {
        values_ = values;
        return self.init();
    };
    self.getValues = function () {
        return values_;
    };
    self.createValues = function () {
        return makeValues_();
    };
    function makeHeaderOb_() {
        return values_ && values_.length ? ((self.hasHeaders() ? values_[0] : values_[0].map(function (d, i) {
            return columnLabelMaker_(i + 1);
        })).reduce(function (p, c) {
            var key = c.toString();
            if (renameBlanks_ && !key) {
                key = columnLabelMaker_(Object.keys(p).length + 1 + blankOffset_);
            }
            if (p.hasOwnProperty(key)) {
                if (!renameDups_) {
                    throw "duplicate column header " + key;
                } else {
                    var nd = 1;
                    while (p.hasOwnProperty(key + nd)) {
                        nd++;
                    }
                    key = key + nd;
                }
            }
            p[key] = Object.keys(p).length;
            return p;
        }, {})) : null;
    }
    function makeDataOb_() {
        var vals = self.hasHeaders() ? values_.slice(1) : values_;
        return headerOb_ ? ((vals || []).map(function (row) {
            return Object.keys(headerOb_).reduce(function (p, c) {
                p[c] = row[headerOb_[c]];
                return p;
            }, {});
        })) : null;
    }
    function makeValues_() {
        var vals = self.hasHeaders() ? [Object.keys(headerOb_)] : [];
        dataOb_.forEach(function (row) {
            vals.push(Object.keys(headerOb_).reduce(function (p, c) {
                p.push(row[c]);
                return p;
            }, []));
        });
        return vals;
    }
    function columnLabelMaker_(columnNumber, s) {
        s = String.fromCharCode(((columnNumber - 1) % 26) + "A".charCodeAt(0)) + (s || "");
        return columnNumber > 26 ? columnLabelMaker_(Math.floor((columnNumber - 1) / 26), s) : s;
    }
    if (sheet) {
        self.populate(sheet);
    } else {
        if (typeof sheet !== typeof undefined) {
            throw "sheet was passed in constructor but could not be opened";
        }
    }
}
,"DriveUtils":{"getShortMime":
function (mimeType) {
    var f = Object.keys(ENUMS.MIMES).filter(function (k) {
        return ENUMS.MIMES[k] === mimeType;
    });
    return f.length ? f[0].toLowerCase() : mimeType.toLowerCase();
}
,"ads":{"getFilesByName":
function (parentId, name, optMime, optFields) {
    return ads.getChildItems(parentId, optMime, optFields || "items/id", "title='" + name + "'" + " and mimeType!='" + ENUMS.MIMES.FOLDER + "'");
}
,"getFoldersByName":
function (parentId, name, optFields) {
    return ads.getChildFolders(parentId, optFields || "items/id", "title='" + name + "'");
}
,"getChildFiles":
function (parentId, optMime, optFields, optExtraQueries) {
    return ads.getChildItems(parentId, optMime, optFields || "items/id", "mimeType!='" + ENUMS.MIMES.FOLDER + "'");
}
,"getChildFolders":
function (parentId, optFields, optExtraQueries) {
    return ads.getChildItems(parentId, ENUMS.MIMES.FOLDER, optFields || "items/id", optExtraQueries);
}
,"getChildItems":
function (parentId, mime, optFields, optExtraQueries) {
    var q = mime ? ["mimeType='" + mime + "'"] : [];
    q.push("trashed=false");
    if (optExtraQueries) {
        var e = Array.isArray(optExtraQueries) ? optExtraQueries : [optExtraQueries];
        Array.prototype.push.apply(q, e);
    }
    var options = {};
    if (optFields) {
        options.fields = optFields;
    }
    if (options.fields && options.fields.indexOf("nextPageToken") === -1) {
        options.fields = (options.fields ? options.fields + "," : "") + "nextPageToken";
    }
    options.q = q.join(" and ");
    var items = [], pageToken;
    do {
        var result = Utils.expBackoff(function () {
            return ns.service.Children.list(parentId, options);
        }, {logAttempts:false});
        pageToken = result.nextPageToken;
        Array.prototype.push.apply(items, result.items);
        options.pageToken = pageToken;
    } while (pageToken);
    return items;
}
,"getFolderFromPath":
function (path) {
    return (path || "/").split("/").reduce(function (prev, current) {
        if (prev && current) {
            var fldrs = ads.getFoldersByName(prev.id, current);
            return fldrs.length ? fldrs[0] : null;
        } else {
            return current ? null : prev;
        }
    }, ns.rootFolder);
}
},"setService":
function (dap) {
    ns.service = dap;
    if (ns.isDriveApp()) {
        ns.rootFolder = Utils.expBackoff(function () {
            return ns.service.getRootFolder();
        });
        ns.rootFolderId = ns.rootFolder.getId();
    } else {
        ns.rootFolder = ns.getFolderById("root");
        ns.rootFolderId = ns.rootFolder.id;
    }
    return ns;
}
,"isDriveApp":
function () {
    ns.checkService();
    return typeof ns.service.continueFolderIterator === "function";
}
,"checkService":
function () {
    if (!ns.service) {
        throw "please do a DriveUtils.setService (yourdriveapp) to inialie namespace";
    }
}
,"getFolders":
function (parent) {
    if (ns.isDriveApp()) {
        return parent.getFolders();
    } else {
        return ns.ads.getChildFolders(parent.id);
    }
}
,"getFiles":
function (parent, mime) {
    if (ns.isDriveApp()) {
        return mime ? ns.service.getFilesByType(mime) : parent.getFiles();
    } else {
        return ns.ads.getChildFiles(parent.id, mime);
    }
}
,"getFileById":
function (id) {
    try {
        return Utils.expBackoff(function () {
            if (!ns.isDriveApp()) {
                return ns.service.Files.get(id, {fields:"id,title"});
            } else {
                return ns.service.getFileById(id);
            }
        }, {logAttempts:false});
    }
    catch (err) {
        return null;
    }
}
,"getFolderById":
function (path) {
    try {
        return Utils.expBackoff(function () {
            if (!ns.isDriveApp()) {
                return ns.service.Files.get(path, {fields:"id,title"});
            } else {
                return ns.service.getFolderById(path);
            }
        }, {logAttempts:false});
    }
    catch (err) {
        return null;
    }
}
,"getPileOfFiles":
function (path, mime, recurse) {
    var pile, startFolder;
    startFolder = ns.getFolderById(path) || ns.getFolderFromPath(path);
    if (!startFolder) {
        throw "folder path/id " + path + " not found";
    }
    if (startFolder) {
        pile = (recurse ? recurseFolders(startFolder, mime) : pileFiles(startFolder, mime));
    }
    return pile;
    function recurseFolders(folder, mime, pile) {
        var it = ns.getFolders(folder);
        if (ns.isDriveApp()) {
            while (it.hasNext()) {
                pile = recurseFolders(it.next(), mime, pile);
            }
        } else {
            it.forEach(function (d) {
                pile = recurseFolders(d, mime, pile);
            });
        }
        return pileFiles(folder, mime, pile);
    }
    function pileFiles(folder, mime, pile) {
        var pile = pile || [];
        Array.prototype.push.apply(pile, getFiles(folder, mime));
        return pile;
    }
    function getFiles(folder, mime) {
        var files = [];
        var it = ns.getFiles(folder, mime);
        folderPath = ns.getPathFromFolder(folder);
        if (ns.isDriveApp()) {
            while (it.hasNext()) {
                var file = it.next();
                var fileName = file.getName();
                files.push({file:file, folder:folder, path:folderPath + fileName, fileName:fileName, id:file.getId()});
            }
        } else {
            it.forEach(function (d) {
                var fileName = ns.getFileById(d.id).title;
                files.push({file:d, folder:folder, path:folderPath + fileName, fileName:fileName, id:d.id});
            });
        }
        return files;
    }
}
,"getFilesFromPath":
function (path) {
    var s = path.split("/");
    if (!s.length) {
        return null;
    }
    var filename = s[s.length - 1];
    var folder = ns.getFolderFromPath("/" + (s.length > 1 ? s.slice(0, s.length - 1).join("/") : ""));
    if (ns.isDriveApp()) {
        return Utils.expBackoff(function () {
            return folder.getFilesByName(filename);
        });
    } else {
        return ns.ads.getFilesByName(folder.id, filename);
    }
}
,"getFolderFromPath":
function (path) {
    if (ns.isDriveApp()) {
        return (path || "/").split("/").reduce(function (prev, current) {
            if (prev && current) {
                var fldrs = Utils.expBackoff(function () {
                    return prev.getFoldersByName(current);
                });
                return fldrs.hasNext() ? fldrs.next() : null;
            } else {
                return current ? null : prev;
            }
        }, ns.rootFolder);
    } else {
        return ns.ads.getFolderFromPath(path);
    }
}
,"getPathFromFolder":
function (folder, optPath) {
    ns.checkService();
    if (!folder) {
        return "";
    }
    var path = optPath || "/";
    return folder.getId() === ns.rootFolderId ? path : ns.getPathFromFolder(folder.getParents().next(), "/" + folder.getName() + path);
}
},"SheetUtils":{"rangeFill":
function (range, propertyName, fillValue, headerRange) {
    var name = propertyName.slice(0, 1).toUpperCase() + propertyName.slice(1);
    if (typeof range["get" + name] !== typeof range["set" + name] || typeof range["set" + name] !== "function") {
        throw new Error(name + " should be a property of a range with a getter and setter");
    }
    var values = range.getValues();
    columnNames = headerRange ? headerRange.getValues()[0] : values[0];
    if (columnNames.length != values[0].length) {
        throw new Error("headers are length " + columnNames.length + " but should be " + values[0].length);
    }
    var properties = name === "Values" ? values : range["get" + name]();
    return range["set" + name](values.map(function (row, rowIndex) {
        return row.map(function (cell, colIndex) {
            return typeof fillValue === "function" ? fillValue({value:cell, propertyValue:properties[rowIndex][colIndex], columnIndex:colIndex, rowValues:row, rowIndex:rowIndex, propertyValues:properties, values:values, range:range, propertyName:propertyName, columnNames:columnNames, columnName:columnNames[colIndex], is:function (n) {
                return columnNames[colIndex] === n;
            }}) : fillValue;
        });
    }));
}
},"FetchUtils":{"setService":
function (dap) {
    ns.service = dap;
    return ns;
}
,"checkService":
function () {
    if (!ns.service) {
        throw "please do a FetchUtils.setService (yoururlfetchapp) to inialise namespace";
    }
}
,"resumeUpload":
function (accessToken, blob, location, start, func) {
    var MAXPOSTSIZE = 1024 * 1024 * 8;
    ns.checkService();
    var content = blob.getBytes();
    var file = {title:blob.getName(), mimeType:blob.getContentType()};
    var chunkFunction = func || function (status) {
        if (status.done) {
            Logger.log(status.resource.title + "(" + status.resource.id + ")" + "\n" + " is finished uploading " + status.content.length + " bytes in " + (status.index + 1) + " chunks " + " (overall transfer rate " + Math.round(content.length * 1000 / (new Date().getTime() - status.startTime)) + " bytes per second)");
        } else {
            if (status.success) {
                Logger.log(status.resource.title + " is " + Math.round(status.ratio * 100) + "% complete " + " (chunk transfer rate " + Math.round(status.size * 1000 / (new Date().getTime() - status.startChunkTime)) + " bytes per second)" + " for chunk " + (status.index + 1));
            } else {
                if (response.getResponseCode() === 503) {
                    throw "error 503 - you can try restarting using " + status.location;
                } else {
                    throw response.getContentText() + " you might be able to restart using " + location;
                }
            }
        }
        return false;
    };
    var startTime = new Date().getTime();
    var pos = 0, index = 0;
    do {
        var startChunkTime = new Date().getTime();
        var chunk = content.slice(pos, Math.min(pos + MAXPOSTSIZE, content.length));
        var options = {contentType:blob.getContentType(), method:"PUT", muteHttpExceptions:true, headers:{"Authorization":"Bearer " + accessToken, "Content-Range":"bytes " + pos + "-" + (pos + chunk.length - 1) + "/" + content.length}};
        options.payload = chunk;
        var response = Utils.expBackoff(function () {
            return ns.service.fetch(location, options);
        });
        var size = chunk.length;
        if (response.getResponseCode() === 308) {
            var ranges = response.getHeaders().Range.split("=")[1].split("-");
            var size = parseInt(ranges[1], 10) - pos + 1;
            if (size !== chunk.length) {
                Logger.log("chunk length mismatch - sent:" + chunk.length + " but confirmed:" + size + ":recovering by resending the difference");
            }
        }
        if (!file.id) {
            try {
                file.id = JSON.parse(response.getContentText()).id;
            }
            catch (err) {
            }
        }
        var status = {start:pos, size:size, index:index, location:location, response:response, content:content, success:response.getResponseCode() === 200 || response.getResponseCode() === 308, done:response.getResponseCode() === 200, ratio:(size + pos) / content.length, resource:file, startTime:startTime, startChunkTime:startChunkTime};
        index++;
        pos += size;
        var cancel = chunkFunction(status);
    } while (!cancel && status.success && !status.done);
    return status;
}
,"resumableUpload":
function (accessToken, blob, folderId, func) {
    ns.checkService();
    var content = blob.getBytes();
    var file = {title:blob.getName(), mimeType:blob.getContentType()};
    if (folderId) {
        file.parents = [{id:folderId}];
    }
    var resourceBody = JSON.stringify(file);
    var headers = {"X-Upload-Content-Type":blob.getContentType(), "X-Upload-Content-Length":content.length, "Authorization":"Bearer " + accessToken};
    var response = Utils.expBackoff(function () {
        return ns.service.fetch("https://www.googleapis.com/upload/drive/v2/files?uploadType=resumable", {headers:headers, method:"POST", muteHttpExceptions:true, payload:resourceBody, contentType:"application/json; charset=UTF-8", contentLengthxx:resourceBody.length});
    });
    if (response.getResponseCode() !== 200) {
        throw "failed on initial upload " + response.getResponseCode();
    }
    var location = getLocation(response);
    return ns.resumeUpload(accessToken, blob, location, 0, func);
    function getLocation(resp) {
        if (resp.getResponseCode() !== 200) {
            throw "failed in setting up resumable upload " + resp.getContentText();
        }
        var location = resp.getHeaders().Location;
        if (!location) {
            throw "failed to get location for resumable uploade";
        }
        return location;
    }
}
},"Include":{"gs":
function (scripts) {
    return "<script>\n" + scripts.map(function (d) {
        return ScriptApp.getResource(d).getDataAsString();
    }).join("\n\n") + "</script>\n";
}
,"html":
function (scripts, ext) {
    return scripts.map(function (d) {
        return HtmlService.createHtmlOutputFromFile(d + (ext || "")).getContent();
    }).join("\n\n");
}
,"js":
function (scripts) {
    return "<script>\n" + ns.html(scripts, ".js") + "</script>\n";
}
,"css":
function (scripts) {
    return "<style>\n" + ns.html(scripts, ".css") + "</style>\n";
}
},"Squeeze":{"Chunking":
function () {
    var chunkSize_ = 9 * 1024, self = this, store_, prefix_ = "chunking_", overhead_ = 12, digestOverhead_ = 40 + 10, respectDigest_ = true;
    var getObject_ = function (store, key) {
        var result = readFromStore_(store, key);
        return result ? JSON.parse(result) : null;
    };
    var setObject_ = function (store, key, ob) {
        var s = JSON.stringify(ob || {});
        writeToStore_(store, key, s);
        return s.length;
    };
    var writeToStore_ = function (store, key, str) {
        return Utils.expBackoff(function () {
            return store.setProperty(key, str);
        });
    };
    var readFromStore_ = function (store, key) {
        return Utils.expBackoff(function () {
            return store.getProperty(key);
        });
    };
    var removeObject_ = function (store, key) {
        return Utils.expBackoff(function () {
            return store.deleteProperty(key);
        });
    };
    self.setChunkSize = function (chunkSize) {
        chunkSize_ = chunkSize;
        return self;
    };
    self.getRespectDigest = function (respectDigest) {
        return respectDigest_;
    };
    self.setRespectDigest = function (respectDigest) {
        respectDigest_ = respectDigest;
        return self;
    };
    self.getChunkSize = function () {
        return chunkSize_;
    };
    self.setPrefix = function (prefix) {
        prefix_ = prefix;
        return self;
    };
    self.getPrefix = function () {
        return prefix_;
    };
    self.setStore = function (store) {
        store_ = store;
        return self;
    };
    self.getStore = function () {
        return store_;
    };
    self.funcGetObject = function (func) {
        getObject_ = checkAFunc(func);
        return self;
    };
    self.funcSetObject = function (func) {
        setObject_ = checkAFunc(func);
        return self;
    };
    self.funcReadFromStore = function (func) {
        readFromStore_ = checkAFunc(func);
        return self;
    };
    self.funcWriteToStore = function (func) {
        writeToStore_ = checkAFunc(func);
        return self;
    };
    self.funcRemoveObject = function (func) {
        removeObject_ = checkAFunc(func);
        return self;
    };
    function checkAFunc(func) {
        if (func && typeof func !== "function") {
            throw new Error("argument should be a function");
        }
        return func;
    }
    function payloadSize_() {
        if (chunkSize_ <= overhead_) {
            throw "chunksize must be at least " + (overhead_ + 1);
        }
        return chunkSize_ - overhead_;
    }
    function digest_(what) {
        return Utils.keyDigest(what);
    }
    function uid_() {
        return Utils.generateUniqueString();
    }
    function getChunkKey_(key) {
        return key + "_" + uid_();
    }
    self.getChunkKeys = function (propKey) {
        var data, crushed = getObject_(self.getStore(), propKey);
        if (crushed && crushed.chunk && crushed.digest) {
            data = crushed.chunk ? JSON.parse(self.unzip(crushed.chunk)) : null;
        }
        return {chunks:crushed && crushed.chunks ? crushed.chunks : null, data:data, digest:crushed ? crushed.digest : ""};
    };
    self.removeBigProperty = function (propKey) {
        var chunky = self.getChunkKeys(prefix_ + propKey);
        if (chunky && chunky.chunks) {
            chunky.chunks.forEach(function (d) {
                removeObject_(self.getStore(), d);
            });
        }
        removeObject_(self.getStore(), prefix_ + propKey);
        return self;
    };
    self.setBigProperty = function (propKey, ob) {
        var sob = JSON.stringify(ob);
        var digest = Utils.keyDigest(sob);
        var master = getObject_(self.getStore(), prefix_ + propKey);
        if (master && master.digest && master.digest === digest && respectDigest_) {
            return 0;
        } else {
            self.removeBigProperty(propKey);
            return setBigProperty_(prefix_ + propKey, ob);
        }
    };
    self.getBigProperty = function (propKey) {
        var chunky = self.getChunkKeys(prefix_ + propKey);
        if (chunky && chunky.chunks) {
            var p = chunky.chunks.reduce(function (p, c) {
                var r = getObject_(self.getStore(), c);
                if (!r) {
                    throw "missing chunked property " + c + " for key " + propKey;
                }
                return p + r.chunk;
            }, "");
            return JSON.parse(self.unzip(p));
        } else {
            return chunky ? chunky.data : null;
        }
    };
    function setBigProperty_(propKey, ob) {
        var sob = JSON.stringify(ob), size = 0;
        var chunks, crushed = self.zip(sob);
        var digest = digest_(sob);
        if (crushed.length > payloadSize_() - digestOverhead_) {
            chunks = [];
        }
        do {
            var chunk = crushed.slice(0, payloadSize_());
            crushed = crushed.slice(chunk.length);
            if (chunks) {
                var key = getChunkKey_(propKey);
                size += setObject_(self.getStore(), key, {chunk:chunk});
                chunks.push(key);
            } else {
                size += setObject_(self.getStore(), propKey, {chunk:chunk, digest:digest});
            }
        } while (crushed.length);
        if (chunks) {
            size += setObject_(self.getStore(), propKey, {chunks:chunks, digest:digest});
        }
        return size;
    }
    self.zip = function (crushThis) {
        return Utilities.base64Encode(Utilities.zip([Utilities.newBlob(crushThis)]).getBytes());
    };
    self.unzip = function (crushed) {
        return Utilities.unzip(Utilities.newBlob(Utilities.base64Decode(crushed), "application/zip"))[0].getDataAsString();
    };
}
},"UserRegistration":{"version":"0.0","register":
function (props, registrationKey) {
    return ns.get(props, registrationKey) || makeob();
    function makeob() {
        var now = new Date().getTime();
        var ob = {id:Utils.generateUniqueString(), visits:-1, created:now};
        return ns.set(props, registrationKey, ob);
    }
}
,"get":
function (props, registrationKey) {
    return closure_(props, registrationKey, getProp_(props, registrationKey));
}
,"set":
function (props, registrationKey, ob) {
    ob.visits++;
    ob.version = ns.version;
    ob.lastVisit = new Date().getTime();
    setProp_(props, registrationKey, ob);
    return closure_(props, registrationKey, ob);
}
},"DriveProper":
function (service) {
    var service_ = service;
    var self = this;
    self.setService = function (service) {
        service_ = service;
        return ns;
    };
    self.update = function (fileId, ob, public) {
        var o = Object.keys(ob).map(function (d) {
            return {key:d, value:ob[d], visibility:public ? "PUBLIC" : "PRIVATE"};
        });
        o.forEach(function (d) {
            service_.Properties.insert(d, fileId);
        });
        return o;
    };
    self.get = function (fileId, all) {
        return service_.Files.get(fileId).properties.filter(function (d) {
            return all || d.visibility === "PRIVATE";
        }).map(function (d) {
            return {key:d.key, value:d.value, visibility:d.visibility};
        });
    };
    self.search = function (ob, all) {
        var pageToken, consolidated = [];
        var searcher = Object.keys(ob).map(function (d) {
            return "(" + ("(properties has { key='" + d + "' and value ='" + ob[d] + "' and visibility = 'PRIVATE' })") + (all ? " or (properties has { key='" + d + "' and value ='" + ob[d] + "' and visibility = 'PUBLIC' })" : "") + ")";
        }).join(" and ");
        do {
            var result = service_.Files.list({q:searcher, pageToken:pageToken});
            pageToken = result.nextPageToken;
            Array.prototype.push.apply(consolidated, result.items.map(function (d) {
                return d.id;
            }));
        } while (pageToken && result.items.length);
        return consolidated;
    };
    self.remove = function (fileId, ob, public) {
        ob.forEach(function (d) {
            service_.Properties.remove(fileId, d, {visibility:public ? "PUBLIC" : "PRIVATE"});
        });
        return self.get(fileId, true);
    };
}
};
