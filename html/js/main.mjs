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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
function make_environment() {
    var envs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        envs[_i] = arguments[_i];
    }
    return new Proxy(envs, {
        get: function (target, prop, receiver) {
            for (var _i = 0, envs_1 = envs; _i < envs_1.length; _i++) {
                var env = envs_1[_i];
                if (env.hasOwnProperty(prop)) {
                    return env[prop];
                }
            }
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.error("NOT IMPLEMENTED: " + prop, args);
            };
        }
    });
}
var wasm_exports = undefined;
var heap_base = 0;
function malloc(nBytes) {
    if (wasm_exports === undefined) {
        throw Error("No wasm!");
    }
    var res = heap_base;
    heap_base += nBytes;
    console.log("alocated ", nBytes);
    return res;
}
function free(ptr) {
    // console.log("leaked")
}
function RunTimeException(ptrErrorStr) {
    throw DecodeStringFromMemory(ptrErrorStr);
}
function DecodeStringFromMemory(strPtr) {
    if (wasm_exports === undefined) {
        return "(MISSING)";
    }
    var memory = wasm_exports.memory;
    var strMem = new Uint8Array(memory.buffer, strPtr);
    var res = "";
    for (var i = 0; i < strMem.length; i++) {
        var char = strMem[i];
        if (char === 0)
            break;
        if (char < 32 || char > 126)
            res += "[".concat(char, "]");
        else
            res += String.fromCharCode(char);
    }
    return res;
}
var NumberToString = function (v) {
    if (Math.abs(v) < 100 && Math.abs(v) > 1e-2 || v === 0.0) {
        return v.toFixed(3);
    }
    return v.toExponential(3);
};
;
window.addEventListener('load', function (_) { return __awaiter(void 0, void 0, void 0, function () {
    var nodeInput1, nodeInput2, posXInput, posYInput, addElementBtn, addNodeBtn, bcTypeXSelect, bcTypeYSelect, bcValueXInput, bcValueYInput, preDefStructuresSelect, nodeListDiv, elementListDiv, solutionListDiv, areaInput, youngModInput, calculateBtn, selectStructureBtn, previewCanvas, drawingContext, toCanvasCoordinates, wa, main, add_node, add_element, solve, get_node_displacement_x, get_node_displacement_y, get_node_force_x, get_node_force_y, memory, bc_force_ptr, bc_displacement_ptr, invalid_id_ptr, deref_int_ptr, bc_force, bc_displacement, invalid_id, create_option, elementList, nodeList, getNode, getElement, addNode, AddElement, AddCraneStructure, AddPonteExemplo, AddWarrenBridgeStructure;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nodeInput1 = document.getElementById("node_number_1_input");
                nodeInput2 = document.getElementById("node_number_2_input");
                posXInput = document.getElementById("pos_x_input");
                posYInput = document.getElementById("pos_y_input");
                addElementBtn = document.getElementById("add_element_btn");
                addNodeBtn = document.getElementById("add_node_btn");
                bcTypeXSelect = document.getElementById("bc_type_x_select");
                bcTypeYSelect = document.getElementById("bc_type_y_select");
                bcValueXInput = document.getElementById("bc_x_value");
                bcValueYInput = document.getElementById("bc_y_value");
                preDefStructuresSelect = document.getElementById("pre_defined_structures_select");
                nodeListDiv = document.getElementById("node_list");
                elementListDiv = document.getElementById("element_list");
                solutionListDiv = document.getElementById("solution_div");
                areaInput = document.getElementById("area_input");
                youngModInput = document.getElementById("young_modulus_input");
                calculateBtn = document.getElementById("calculate_btn");
                selectStructureBtn = document.getElementById("select_structure_btn");
                previewCanvas = document.getElementById("structure_preview_canvas");
                if (!nodeInput1 || !nodeInput2 || !addElementBtn
                    || !addNodeBtn || !posXInput || !posYInput
                    || !bcTypeXSelect || !bcTypeYSelect || !bcValueXInput
                    || !bcValueYInput || !areaInput || !youngModInput
                    || !preDefStructuresSelect || !previewCanvas
                    || !solutionListDiv) {
                    throw "Missing buttons or inputs!";
                }
                drawingContext = previewCanvas.getContext("2d");
                if (!drawingContext) {
                    console.log("Browser does not support drawing!");
                    throw "No support!";
                }
                toCanvasCoordinates = function (pos_x, pos_y) {
                    var real_to_pixel_ratio = 30;
                    var margin_left = 0.1 * previewCanvas.width;
                    var margin_bottom = 0.1 * previewCanvas.height;
                    var out_pos_x = pos_x * real_to_pixel_ratio + margin_left;
                    var out_pos_y = pos_y * real_to_pixel_ratio * -1 + previewCanvas.height - margin_bottom;
                    return {
                        pos_x: out_pos_x,
                        pos_y: out_pos_y
                    };
                };
                return [4 /*yield*/, WebAssembly.instantiateStreaming(fetch('./js/main.wasm'), {
                        "env": make_environment({
                            malloc: malloc,
                            free: free,
                            RunTimeException: RunTimeException,
                            print: function (strPtr) { console.log(DecodeStringFromMemory(strPtr)); },
                            cos: function (v) { return Math.cos(v); },
                            acos: function (v) { return Math.acos(v); },
                            sin: function (v) { return Math.sin(v); },
                            sqrt: function (v) { return Math.sqrt(v); },
                            atan2: function (a, b) { return Math.atan2(a, b); },
                        }),
                    })];
            case 1:
                wa = _a.sent();
                wasm_exports = wa.instance.exports;
                heap_base = wasm_exports.__heap_base.value;
                main = wasm_exports.main;
                add_node = wasm_exports.AddNode;
                add_element = wasm_exports.AddElement;
                solve = wasm_exports.Solve;
                get_node_displacement_x = wasm_exports.GetNodeDisplacementX;
                get_node_displacement_y = wasm_exports.GetNodeDisplacementY;
                get_node_force_x = wasm_exports.GetNodeForceX;
                get_node_force_y = wasm_exports.GetNodeForceY;
                memory = wasm_exports.memory;
                bc_force_ptr = wasm_exports.kBcForce;
                bc_displacement_ptr = wasm_exports.kBcDisplacement;
                invalid_id_ptr = wasm_exports.kInvalidId;
                deref_int_ptr = function (int_ptr) {
                    console.log("int_ptr", int_ptr);
                    return new Int32Array(memory.buffer, int_ptr, 1)[0];
                };
                bc_force = deref_int_ptr(bc_force_ptr);
                bc_displacement = deref_int_ptr(bc_displacement_ptr);
                invalid_id = deref_int_ptr(invalid_id_ptr);
                create_option = function (name, value) {
                    var optn = document.createElement("option");
                    optn.value = value;
                    optn.innerHTML = name;
                    return optn;
                };
                bcTypeXSelect.appendChild(create_option("Deslocamento", bc_displacement.toString()));
                bcTypeXSelect.appendChild(create_option("Força", bc_force.toString()));
                bcTypeYSelect.appendChild(create_option("Deslocamento", bc_displacement.toString()));
                bcTypeYSelect.appendChild(create_option("Força", bc_force.toString()));
                elementList = [];
                nodeList = [];
                getNode = function (node_id, pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value) {
                    var bc_type_x_str = (bc_type_x == bc_force ? "Force" : "Displacement");
                    var bc_type_y_str = (bc_type_y == bc_force ? "Force" : "Displacement");
                    return {
                        id: node_id,
                        pos_x: pos_x,
                        pos_y: pos_y,
                        bc_type_x: bc_type_x_str,
                        bc_value_x: bc_x_value,
                        bc_type_y: bc_type_y_str,
                        bc_value_y: bc_y_value,
                    };
                };
                getElement = function (node_id_1, node_id_2, A, E) {
                    return {
                        node_id_1: node_id_1,
                        node_id_2: node_id_2,
                        A: A,
                        E: E
                    };
                };
                addNode = function (pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value) {
                    var node_id = add_node(pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value);
                    if (node_id === invalid_id) {
                        throw "Got invalid id!";
                    }
                    console.log("Added node with id: ", node_id);
                    var node = getNode(node_id, pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value);
                    nodeList.push(node);
                    nodeListDiv.innerHTML += "\n            <tr>\n                <th scope=\"row\">".concat(node.id, "</th>\n                <td>").concat(node.pos_x, "</td>\n                <td>").concat(node.pos_y, "</td>\n                <td>").concat(node.bc_type_x, "</td>\n                <td>").concat(node.bc_value_x, "</td>\n                <td>").concat(node.bc_type_y, "</td>\n                <td>").concat(node.bc_value_y, "</td>\n            </tr>\n        ");
                };
                addNodeBtn.addEventListener("mouseup", function () {
                    console.log("addNodeBtn mouseup");
                    var pos_x = posXInput.valueAsNumber;
                    var pos_y = posYInput.valueAsNumber;
                    var bc_type_x = parseInt(bcTypeXSelect.options[bcTypeXSelect.selectedIndex].value);
                    var bc_x_value = bcValueXInput.valueAsNumber;
                    var bc_type_y = parseInt(bcTypeYSelect.options[bcTypeYSelect.selectedIndex].value);
                    var bc_y_value = bcValueYInput.valueAsNumber;
                    addNode(pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value);
                });
                AddElement = function (node_id_1, node_id_2, E, A) {
                    var element_id = add_element(node_id_1, node_id_2, E, A);
                    if (element_id === invalid_id) {
                        throw "Got invalid id!";
                    }
                    console.log("Added element with id: ", element_id);
                    elementList.push(element_id);
                    elementListDiv.innerHTML += "\n            <tr>\n                <th scope=\"row\">".concat(node_id_1, "</th>\n                <td>").concat(node_id_2, "</td>\n                <td>").concat(NumberToString(A), "</td>\n                <td>").concat(NumberToString(E), "</div>\n            </tr>\n        ");
                    var node_1 = nodeList[node_id_1];
                    var node_2 = nodeList[node_id_2];
                    drawingContext.beginPath();
                    drawingContext.strokeStyle = "rgb(70, 52, 235)";
                    drawingContext.font = "18px serif ";
                    drawingContext.lineWidth = 2;
                    {
                        var _a = toCanvasCoordinates(node_1.pos_x, node_1.pos_y), pos_x = _a.pos_x, pos_y = _a.pos_y;
                        drawingContext.shadowColor = "white";
                        drawingContext.shadowBlur = 7;
                        drawingContext.fillText(node_1.id.toString(), pos_x, pos_y);
                        drawingContext.moveTo(pos_x, pos_y);
                    }
                    {
                        var _b = toCanvasCoordinates(node_2.pos_x, node_2.pos_y), pos_x = _b.pos_x, pos_y = _b.pos_y;
                        drawingContext.shadowColor = "white";
                        drawingContext.shadowBlur = 7;
                        drawingContext.fillText(node_2.id.toString(), pos_x, pos_y);
                        drawingContext.lineTo(pos_x, pos_y);
                    }
                    drawingContext.stroke();
                };
                addElementBtn.addEventListener("mouseup", function () {
                    var node_id_1 = nodeInput1.valueAsNumber;
                    var node_id_2 = nodeInput2.valueAsNumber;
                    var E = youngModInput.valueAsNumber;
                    var A = areaInput.valueAsNumber;
                    AddElement(node_id_1, node_id_2, E, A);
                });
                calculateBtn.addEventListener("mouseup", function () {
                    solve();
                    for (var _i = 0, nodeList_1 = nodeList; _i < nodeList_1.length; _i++) {
                        var node = nodeList_1[_i];
                        solutionListDiv.innerHTML += "\n                <tr>\n                    <th scope=\"row\">".concat(node.id, "</th>\n                    <td>").concat(NumberToString(get_node_displacement_x(node.id)), "</td>\n                    <td>").concat(NumberToString(get_node_displacement_y(node.id)), "</td>\n                    <td>").concat(NumberToString(get_node_force_x(node.id)), "</td>\n                    <td>").concat(NumberToString(get_node_force_y(node.id)), "</td>\n                </tr>\n            ");
                    }
                });
                AddCraneStructure = function () {
                    var nodes_x = [
                        0, 2, 0, 2, 0, 2, 0, 2, 2, 6
                    ];
                    var nodes_y = [
                        0, 0, 2, 2, 4, 4, 6, 6, 8, 6
                    ];
                    var boundary_conds_x = [
                        [bc_force, 0],
                        [bc_displacement, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                    ];
                    var boundary_conds_y = [
                        [bc_displacement, 0],
                        [bc_displacement, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, -1e4],
                    ];
                    if (nodes_x.length != nodes_y.length ||
                        boundary_conds_x.length != boundary_conds_y.length ||
                        boundary_conds_x.length != nodes_x.length) {
                        throw "Invalid nodes!";
                    }
                    var elements = [
                        [1, 2],
                        [1, 3],
                        [2, 3],
                        [2, 4],
                        [3, 4],
                        [3, 5],
                        [5, 4],
                        [4, 6],
                        [5, 6],
                        [5, 7],
                        [6, 7],
                        [6, 8],
                        [7, 8],
                        [8, 10],
                        [7, 9],
                        [8, 9],
                        [9, 10],
                    ];
                    var A = 0.0004;
                    var E = 2.1e11;
                    for (var i = 0; i < nodes_x.length; i++) {
                        addNode(nodes_x[i], nodes_y[i], boundary_conds_x[i][0], boundary_conds_x[i][1], boundary_conds_y[i][0], boundary_conds_y[i][1]);
                    }
                    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                        var ele = elements_1[_i];
                        AddElement(ele[0] - 1, ele[1] - 1, E, A);
                    }
                };
                AddPonteExemplo = function () {
                    var nodes = {
                        1: getNode(0.0, 0.0, 0.0, bc_displacement, 0.0, bc_displacement, 0.0),
                        2: getNode(1, 2.0, 0.0, bc_force, 0, bc_force, -8.75e3),
                        3: getNode(2, 3.5, 0.0, bc_force, 0, bc_force, -7.50e3),
                        4: getNode(3, 5.0, 0.0, bc_force, 0, bc_force, -7.50e3),
                        5: getNode(4, 6.5, 0.0, bc_force, 0, bc_force, -7.50e3),
                        6: getNode(5, 8.0, 0.0, bc_force, 0, bc_force, -8.75e3),
                        7: getNode(6, 10.0, 0.0, bc_force, 0, bc_displacement, 0),
                        8: getNode(7, 0.4963, 1.5, bc_force, 0, bc_force, 0),
                        9: getNode(7, 2.0, 2.0, bc_force, 0, bc_force, 0),
                        10: getNode(7, 3.5, 2.5, bc_force, 0, bc_force, 0),
                        11: getNode(7, 5.0, 2.5, bc_force, 0, bc_force, 0),
                        12: getNode(7, 6.5, 2.5, bc_force, 0, bc_force, 0),
                        13: getNode(7, 8.0, 2.0, bc_force, 0, bc_force, 0),
                        14: getNode(7, 10 - 0.4963, 1.5, bc_force, 0, bc_force, 0),
                    };
                    var A1 = 146e-6;
                    var A2 = 284e-6;
                    var E = 210000e6;
                    var elements = {
                        1: getElement(1, 8, A2, E),
                        3: getElement(8, 9, A2, E),
                        4: getElement(9, 10, A2, E),
                        5: getElement(10, 11, A2, E),
                        6: getElement(11, 12, A2, E),
                        7: getElement(12, 13, A2, E),
                        8: getElement(13, 14, A2, E),
                        9: getElement(14, 7, A2, E),
                        10: getElement(7, 6, A1, E),
                        11: getElement(1, 2, A1, E),
                        12: getElement(2, 3, A2, E),
                        13: getElement(3, 4, A2, E),
                        14: getElement(4, 5, A2, E),
                        15: getElement(5, 6, A2, E),
                        16: getElement(4, 11, A1, E),
                        17: getElement(4, 10, A1, E),
                        18: getElement(4, 12, A1, E),
                        19: getElement(3, 10, A1, E),
                        20: getElement(5, 12, A1, E),
                        21: getElement(3, 9, A1, E),
                        22: getElement(2, 9, A1, E),
                        23: getElement(5, 13, A1, E),
                        24: getElement(6, 13, A1, E),
                        25: getElement(2, 8, A2, E),
                        26: getElement(6, 14, A2, E),
                    };
                    for (var _i = 0, _a = Object.entries(nodes); _i < _a.length; _i++) {
                        var _b = _a[_i], _1 = _b[0], node = _b[1];
                        var bc_type_x = node.bc_type_x == "Displacement" ? bc_displacement : bc_force;
                        var bc_type_y = node.bc_type_y == "Displacement" ? bc_displacement : bc_force;
                        addNode(node.pos_x, node.pos_y, bc_type_x, node.bc_value_x, bc_type_y, node.bc_value_y);
                    }
                    for (var _c = 0, _d = Object.entries(elements); _c < _d.length; _c++) {
                        var _e = _d[_c], _2 = _e[0], element = _e[1];
                        AddElement(element.node_id_1 - 1, element.node_id_2 - 1, element.E, element.A);
                    }
                };
                AddWarrenBridgeStructure = function () {
                    var nodes_x = [
                        0, 3, 6, 9, 12, 15, 18,
                        1.5, 4.5, 7.5, 10.5, 13.5, 16.5
                    ];
                    var nodes_y = [
                        0, 0, 0, 0, 0, 0, 0,
                        3, 3, 3, 3, 3, 3
                    ];
                    var boundary_conds_x = [
                        [bc_displacement, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                    ];
                    var boundary_conds_y = [
                        [bc_displacement, 0],
                        [bc_force, 0],
                        [bc_force, -10],
                        [bc_force, -10],
                        [bc_force, -10],
                        [bc_force, 0],
                        [bc_displacement, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                        [bc_force, 0],
                    ];
                    if (nodes_x.length != nodes_y.length ||
                        boundary_conds_x.length != boundary_conds_y.length ||
                        boundary_conds_x.length != nodes_x.length) {
                        throw "Invalid nodes!";
                    }
                    var elements = [
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6],
                        [6, 7],
                        [1, 8],
                        [8, 9],
                        [9, 10],
                        [10, 11],
                        [11, 12],
                        [12, 13],
                        [2, 8],
                        [2, 9],
                        [3, 9],
                        [3, 10],
                        [4, 10],
                        [4, 11],
                        [5, 11],
                        [5, 12],
                        [6, 12],
                        [6, 13],
                        [13, 7],
                    ];
                    var A = 0.01;
                    var E = 2.1e11;
                    for (var i = 0; i < nodes_x.length; i++) {
                        addNode(nodes_x[i], nodes_y[i], boundary_conds_x[i][0], boundary_conds_x[i][1], boundary_conds_y[i][0], boundary_conds_y[i][1]);
                    }
                    for (var _i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
                        var ele = elements_2[_i];
                        AddElement(ele[0] - 1, ele[1] - 1, E, A);
                    }
                };
                selectStructureBtn.addEventListener("mouseup", function () {
                    if (preDefStructuresSelect.value === "warren") {
                        AddWarrenBridgeStructure();
                        selectStructureBtn.disabled = true;
                    }
                    else if (preDefStructuresSelect.value === "crane") {
                        AddCraneStructure();
                        selectStructureBtn.disabled = true;
                    }
                    else if (preDefStructuresSelect.value === "exemplo") {
                        AddPonteExemplo();
                        selectStructureBtn.disabled = true;
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
export {};
