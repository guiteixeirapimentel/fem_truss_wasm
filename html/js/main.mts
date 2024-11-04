function make_environment(...envs: any) {
    return new Proxy(envs, {
        get(target: any, prop: any, receiver) {
            for (let env of envs) {
                if (env.hasOwnProperty(prop)) {
                    return env[prop];
                }
            }
            return (...args: any[]) => {console.error("NOT IMPLEMENTED: "+prop, args)}
        }
    });
}

var wasm_exports : WebAssembly.Exports | undefined = undefined;
var heap_base = 0;

function malloc(nBytes: number) : number {
    if(wasm_exports === undefined) {
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

function RunTimeException(ptrErrorStr: number) : void {
    throw DecodeStringFromMemory(ptrErrorStr);
}

function DecodeStringFromMemory(strPtr: number):string {
    if(wasm_exports === undefined) {
        return "(MISSING)";
    }
    const memory = wasm_exports.memory as WebAssembly.Memory;

    const strMem = new Uint8Array(memory.buffer, strPtr);
    let res = "";
    for (var i=0; i<strMem.length; i++) {
        const char = strMem[i];
        if(char === 0) break;
        if(char < 32 || char > 126) res += `[${char}]`;
        else res += String.fromCharCode(char);
    }

    return res;
}

window.addEventListener('load', async (_: Event) => {

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
                "print": (strPtr: number) => { console.log(DecodeStringFromMemory(strPtr)); },
            },
        ),
    });

    wasm_exports = wa.instance.exports;
    heap_base = (wasm_exports.__heap_base as WebAssembly.Global).value;

    const main = wasm_exports.main as () => number;

    console.log(main());

    // const get_screen_buffer = wasm_exports.get_screen_buffer as ((width: number, height: number) => number);
    // const update_screen_buffer = wasm_exports.update_screen_buffer as () => void;
  
    // const backImageData = new ImageData(250, 250);
    // backImageData.data.fill(0);
    
    // const view = new Uint32Array(backImageData.data.buffer);
    // for(let i = 0; i < backImageData.data.byteLength/4; i++)
    // {
    //     view[i] = 0xFF00FFFF;
    // }

    // const backCanvas = new OffscreenCanvas(250, 250);
    // const backCtx = backCanvas.getContext("2d");

    // if(backCtx === null)
    // {
    //     throw new Error('invalid back ctx');
    // }
    
    // const memory = wasm_exports.memory as WebAssembly.Memory;
    // memory.grow(10);

    // const res = add(1, 2);

    // console.log(new Int32Array(memory.buffer, res, 1)[0]);

    // const ptr = get_screen_buffer(250, 250);

    // const canvas = document.getElementById('app') as HTMLCanvasElement;

    // if(canvas === undefined) {
    //     throw new Error('Could not find canvas');
    // }

    // canvas.width = 800;
    // canvas.height = 600;

    // const ctx = canvas.getContext('2d');

    // if(ctx === null)
    // {
    //     throw new Error('Bad context from canvas!');
    // }

    // console.log(ptr);

    // const callback = () => {
    //     update_screen_buffer();

    //     const array_screen_buff = new Int32Array(memory.buffer, ptr);
    //     const viewBackImageData = new Int32Array(backImageData.data.buffer);
    //     array_screen_buff[0 + (0 * 250)] = 0xFEFEFEFF;

    //     for(let i = 0; i < 250; i++)
    //     {
    //         for(let j = 0; j < 250; j++)
    //         {
    //             viewBackImageData[i + (j * 250)] = array_screen_buff[i + (j * 250)];    
                
    //         }
    //     }
    //     backCtx.putImageData(backImageData, 0, 0);
        
    //     ctx.drawImage(backCtx.canvas, 0, 0);
        
    //     ctx.strokeStyle = 'green';
    //     ctx.beginPath();
    //     ctx.moveTo(0, 0);
    //     ctx.lineTo(200, 200);
    //     ctx.stroke();

    //     setTimeout(callback, 16);
    // };
    
    // callback();
});