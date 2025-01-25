function make_environment(...envs: any) {
    return new Proxy(envs, {
        get(target: any, prop: any, receiver) {
            for (let env of envs) {
                if (env.hasOwnProperty(prop)) {
                    return env[prop];
                }
            }
            return (...args: any[]) => { console.error("NOT IMPLEMENTED: " + prop, args) }
        }
    });
}

var wasm_exports: WebAssembly.Exports | undefined = undefined;
var heap_base = 0;

function malloc(nBytes: number): number {
    if (wasm_exports === undefined) {
        throw Error("No wasm!");
    }
    const res = heap_base;

    heap_base += nBytes;

    console.log("alocated ", nBytes);

    return res;
}

function free(ptr: number): void {
    // console.log("leaked")
}

function RunTimeException(ptrErrorStr: number): void {
    throw DecodeStringFromMemory(ptrErrorStr);
}

function DecodeStringFromMemory(strPtr: number): string {
    if (wasm_exports === undefined) {
        return "(MISSING)";
    }
    const memory = wasm_exports.memory as WebAssembly.Memory;

    const strMem = new Uint8Array(memory.buffer, strPtr);
    let res = "";
    for (var i = 0; i < strMem.length; i++) {
        const char = strMem[i];
        if (char === 0) break;
        if (char < 32 || char > 126) res += `[${char}]`;
        else res += String.fromCharCode(char);
    }

    return res;
}

const NumberToString = (v: number) => {
    if (Math.abs(v) < 100 && Math.abs(v) > 1e-2 || v === 0.0) {
        return v.toFixed(3);
    }

    return v.toExponential(3);
};

interface Node {
    id: number;
    pos_x: number;
    pos_y: number;
    bc_type_x: "Force" | "Displacement";
    bc_value_x: number;
    bc_type_y: "Force" | "Displacement";
    bc_value_y: number;
};

interface Element {
    node_id_1: number;
    node_id_2: number;
    A: number;
    E: number;
}

window.addEventListener('load', async (_: Event) => {

    const nodeInput1 = document.getElementById("node_number_1_input") as HTMLInputElement;
    const nodeInput2 = document.getElementById("node_number_2_input") as HTMLInputElement;
    const posXInput = document.getElementById("pos_x_input") as HTMLInputElement;
    const posYInput = document.getElementById("pos_y_input") as HTMLInputElement;
    const addElementBtn = document.getElementById("add_element_btn") as HTMLButtonElement;
    const addNodeBtn = document.getElementById("add_node_btn") as HTMLButtonElement;
    const bcTypeXSelect = document.getElementById("bc_type_x_select") as HTMLSelectElement;
    const bcTypeYSelect = document.getElementById("bc_type_y_select") as HTMLSelectElement;
    const bcValueXInput = document.getElementById("bc_x_value") as HTMLInputElement;
    const bcValueYInput = document.getElementById("bc_y_value") as HTMLInputElement;
    const preDefStructuresSelect = document.getElementById("pre_defined_structures_select") as HTMLSelectElement;

    const nodeListDiv = document.getElementById("node_list") as HTMLDivElement;
    const elementListDiv = document.getElementById("element_list") as HTMLDivElement;
    const solutionListDiv = document.getElementById("solution_div") as HTMLDivElement;

    const areaInput = document.getElementById("area_input") as HTMLInputElement;
    const youngModInput = document.getElementById("young_modulus_input") as HTMLInputElement;

    const calculateBtn = document.getElementById("calculate_btn") as HTMLButtonElement;

    const selectStructureBtn = document.getElementById("select_structure_btn") as HTMLButtonElement;

    const previewCanvas = document.getElementById("structure_preview_canvas") as HTMLCanvasElement;

    if (!nodeInput1 || !nodeInput2 || !addElementBtn
        || !addNodeBtn || !posXInput || !posYInput
        || !bcTypeXSelect || !bcTypeYSelect || !bcValueXInput
        || !bcValueYInput || !areaInput || !youngModInput
        || !preDefStructuresSelect || !previewCanvas
        || !solutionListDiv) {
        throw "Missing buttons or inputs!";
    }

    const drawingContext = previewCanvas.getContext("2d");

    if (!drawingContext) {
        console.log("Browser does not support drawing!");
        throw "No support!";
    }

    const toCanvasCoordinates = (pos_x: number, pos_y: number) => {
        const real_to_pixel_ratio = 30;
        const margin_left = 0.1 * previewCanvas.width;
        const margin_bottom = 0.1 * previewCanvas.height;
        const out_pos_x = pos_x * real_to_pixel_ratio + margin_left;
        const out_pos_y = pos_y * real_to_pixel_ratio * -1 + previewCanvas.height - margin_bottom;

        return {
            pos_x: out_pos_x,
            pos_y: out_pos_y
        }
    };

    // const newMemory = new WebAssembly.Memory({
    //     initial: 10,
    //     maximum: 100,
    //     shared: true,
    //   });

    const wa = await WebAssembly.instantiateStreaming(fetch('./js/main.wasm'), {
        "env": make_environment(
            {
                malloc,
                free,
                RunTimeException,
                print: (strPtr: number) => { console.log(DecodeStringFromMemory(strPtr)); },
                cos: (v: number) => Math.cos(v),
                acos: (v: number) => Math.acos(v),
                sin: (v: number) => Math.sin(v),
                sqrt: (v: number) => Math.sqrt(v),
                atan2: (a: number, b: number) => Math.atan2(a, b),
            },
        ),
    });

    wasm_exports = wa.instance.exports;
    heap_base = (wasm_exports.__heap_base as WebAssembly.Global).value;

    // const main = wasm_exports.main as () => number;
    const main = wasm_exports.main as () => number;

    const add_node = wasm_exports.AddNode as
        (pos_x: number, pos_y: number, bc_x_type: number,
            bc_x_value: number, bc_y_type: number, bc_y_value: number) => number;
    const add_element = wasm_exports.AddElement as
        (node_id_i: number, node_id_f: number, young_mod: number, area: number) => number;

    const solve = wasm_exports.Solve as () => undefined;

    const get_node_displacement_x = wasm_exports.GetNodeDisplacementX as (node_id: number) => number;
    const get_node_displacement_y = wasm_exports.GetNodeDisplacementY as (node_id: number) => number;

    const get_node_force_x = wasm_exports.GetNodeForceX as (node_id: number) => number;
    const get_node_force_y = wasm_exports.GetNodeForceY as (node_id: number) => number;

    const memory = wasm_exports.memory as WebAssembly.Memory;

    const bc_force_ptr = wasm_exports.kBcForce as unknown as number;
    const bc_displacement_ptr = wasm_exports.kBcDisplacement as unknown as number;
    const invalid_id_ptr = wasm_exports.kInvalidId as unknown as number;

    const deref_int_ptr = (int_ptr: number) => {
        console.log("int_ptr", int_ptr)
        return new Int32Array(memory.buffer, int_ptr, 1)[0]
    };

    const bc_force = deref_int_ptr(bc_force_ptr);
    const bc_displacement = deref_int_ptr(bc_displacement_ptr);
    const invalid_id = deref_int_ptr(invalid_id_ptr);

    const create_option = (name: string, value: string) => {
        const optn = document.createElement("option");
        optn.value = value;
        optn.innerHTML = name;

        return optn;
    };

    bcTypeXSelect.appendChild(create_option("Deslocamento", bc_displacement.toString()));
    bcTypeXSelect.appendChild(create_option("Força", bc_force.toString()));

    bcTypeYSelect.appendChild(create_option("Deslocamento", bc_displacement.toString()));
    bcTypeYSelect.appendChild(create_option("Força", bc_force.toString()));

    const elementList: number[] = [];

    const nodeList: Node[] = [];

    const getNode = (node_id: number, pos_x: number, pos_y: number, bc_type_x: number,
        bc_x_value: number, bc_type_y: number, bc_y_value: number) => {
        const bc_type_x_str = (bc_type_x == bc_force ? "Force" : "Displacement");
        const bc_type_y_str = (bc_type_y == bc_force ? "Force" : "Displacement");

        return {
            id: node_id,
            pos_x: pos_x,
            pos_y: pos_y,
            bc_type_x: bc_type_x_str,
            bc_value_x: bc_x_value,
            bc_type_y: bc_type_y_str,
            bc_value_y: bc_y_value,
        } as Node;
    };

    const getElement = (node_id_1: number, node_id_2: number, A: number, E: number) => {
        return {
            node_id_1, node_id_2, A, E
        } as Element;
    };

    const addNode = (pos_x: number, pos_y: number, bc_type_x: number,
        bc_x_value: number, bc_type_y: number, bc_y_value: number) => {

        const node_id = add_node(pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value);

        if (node_id === invalid_id) {
            throw "Got invalid id!";
        }

        console.log("Added node with id: ", node_id);

        const node = getNode(node_id, pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value);

        nodeList.push(node);

        nodeListDiv.innerHTML += `
            <tr>
                <th scope="row">${node.id}</th>
                <td>${node.pos_x}</td>
                <td>${node.pos_y}</td>
                <td>${node.bc_type_x}</td>
                <td>${node.bc_value_x}</td>
                <td>${node.bc_type_y}</td>
                <td>${node.bc_value_y}</td>
            </tr>
        `;
    }

    addNodeBtn.addEventListener("mouseup", () => {
        console.log("addNodeBtn mouseup")
        const pos_x = posXInput.valueAsNumber;
        const pos_y = posYInput.valueAsNumber;
        const bc_type_x = parseInt(bcTypeXSelect.options[bcTypeXSelect.selectedIndex].value);
        const bc_x_value = bcValueXInput.valueAsNumber;
        const bc_type_y = parseInt(bcTypeYSelect.options[bcTypeYSelect.selectedIndex].value);
        const bc_y_value = bcValueYInput.valueAsNumber;

        addNode(pos_x, pos_y, bc_type_x, bc_x_value, bc_type_y, bc_y_value);
    });

    const AddElement = (node_id_1: number, node_id_2: number, E: number, A: number) => {
        const element_id = add_element(node_id_1, node_id_2, E, A);

        if (element_id === invalid_id) {
            throw "Got invalid id!";
        }
        console.log("Added element with id: ", element_id);
        elementList.push(element_id);

        elementListDiv.innerHTML += `
            <tr>
                <th scope="row">${node_id_1}</th>
                <td>${node_id_2}</td>
                <td>${NumberToString(A)}</td>
                <td>${NumberToString(E)}</div>
            </tr>
        `;

        const node_1 = nodeList[node_id_1];
        const node_2 = nodeList[node_id_2];


        drawingContext.beginPath();
        drawingContext.strokeStyle = `rgb(70, 52, 235)`;
        drawingContext.font = "18px serif ";

        drawingContext.lineWidth = 2;
        {
            const { pos_x, pos_y } = toCanvasCoordinates(node_1.pos_x, node_1.pos_y);
            drawingContext.shadowColor = "white";
            drawingContext.shadowBlur = 7;
            drawingContext.fillText(node_1.id.toString(), pos_x, pos_y);
            drawingContext.moveTo(pos_x, pos_y);
        }
        {
            const { pos_x, pos_y } = toCanvasCoordinates(node_2.pos_x, node_2.pos_y);
            drawingContext.shadowColor = "white";
            drawingContext.shadowBlur = 7;
            drawingContext.fillText(node_2.id.toString(), pos_x, pos_y);
            drawingContext.lineTo(pos_x, pos_y);
        }
        drawingContext.stroke();
    };

    addElementBtn.addEventListener("mouseup", () => {
        const node_id_1 = nodeInput1.valueAsNumber;
        const node_id_2 = nodeInput2.valueAsNumber;
        const E = youngModInput.valueAsNumber;
        const A = areaInput.valueAsNumber;

        AddElement(node_id_1, node_id_2, E, A);
    });

    calculateBtn.addEventListener("mouseup", () => {
        solve();

        for (const node of nodeList) {
            solutionListDiv.innerHTML += `
                <tr>
                    <th scope="row">${node.id}</th>
                    <td>${NumberToString(get_node_displacement_x(node.id))}</td>
                    <td>${NumberToString(get_node_displacement_y(node.id))}</td>
                    <td>${NumberToString(get_node_force_x(node.id))}</td>
                    <td>${NumberToString(get_node_force_y(node.id))}</td>
                </tr>
            `;
        }

    });

    const AddCraneStructure = () => {
        const nodes_x = [
            0, 2, 0, 2, 0, 2, 0, 2, 2, 6
        ];
        const nodes_y = [
            0, 0, 2, 2, 4, 4, 6, 6, 8, 6
        ];

        const boundary_conds_x = [
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

        const boundary_conds_y = [
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
            boundary_conds_x.length != nodes_x.length
        ) {
            throw "Invalid nodes!";
        }

        const elements = [
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

        const A = 0.0004;
        const E = 2.1e11;

        for (let i = 0; i < nodes_x.length; i++) {
            addNode(nodes_x[i], nodes_y[i], boundary_conds_x[i][0], boundary_conds_x[i][1],
                boundary_conds_y[i][0], boundary_conds_y[i][1])
        }

        for (let ele of elements) {
            AddElement(ele[0] - 1, ele[1] - 1, E, A);
        }
    };

    const AddPonteExemplo = () => {
        const nodes = {
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

        const A1 = 146e-6;
        const A2 = 284e-6;
        const E = 210000e6;


        const elements = {
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

        for (const [_, node] of Object.entries(nodes)) {
            const bc_type_x = node.bc_type_x == "Displacement" ? bc_displacement : bc_force;
            const bc_type_y = node.bc_type_y == "Displacement" ? bc_displacement : bc_force;
            addNode(node.pos_x, node.pos_y, bc_type_x, node.bc_value_x, bc_type_y, node.bc_value_y);
        }

        for (const [_, element] of Object.entries(elements)) {
            AddElement(element.node_id_1 - 1, element.node_id_2 - 1, element.E, element.A);
        }
    };

    const AddWarrenBridgeStructure = () => {
        const nodes_x = [
            0, 3, 6, 9, 12, 15, 18,
            1.5, 4.5, 7.5, 10.5, 13.5, 16.5
        ];
        const nodes_y = [
            0, 0, 0, 0, 0, 0, 0,
            3, 3, 3, 3, 3, 3
        ];

        const boundary_conds_x = [
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

        const boundary_conds_y = [
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
            boundary_conds_x.length != nodes_x.length
        ) {
            throw "Invalid nodes!";
        }

        const elements = [
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

        const A = 0.01;
        const E = 2.1e11;

        for (let i = 0; i < nodes_x.length; i++) {
            addNode(nodes_x[i], nodes_y[i], boundary_conds_x[i][0], boundary_conds_x[i][1],
                boundary_conds_y[i][0], boundary_conds_y[i][1])
        }

        for (let ele of elements) {
            AddElement(ele[0] - 1, ele[1] - 1, E, A);
        }
    };

    selectStructureBtn.addEventListener("mouseup", () => {
        if (preDefStructuresSelect.value === "warren") {
            AddWarrenBridgeStructure();
            selectStructureBtn.disabled = true;
        } else if (preDefStructuresSelect.value === "crane") {
            AddCraneStructure();
            selectStructureBtn.disabled = true;
        } else if (preDefStructuresSelect.value === "exemplo") {
            AddPonteExemplo();
            selectStructureBtn.disabled = true;
        }
    });
});