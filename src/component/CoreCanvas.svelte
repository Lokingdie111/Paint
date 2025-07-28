<script lang="ts">
    import { onMount, tick } from "svelte";
    import { Color } from "$lib/Color"
    import { invoke } from "@tauri-apps/api/core";
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    export let color: Color;
    export let lineWidth: number;

    let datas: ImageData[] = [];
    let datasCursor: number = -1;

    let isDrawing: boolean = false;
    let leaved: boolean = true;

    let pressedKeys: Set<string> = new Set();

    $: {
        console.log("VALUE CHANGED!", color, lineWidth);
        updateColor();
        updateLineWidth();
    };
    function enterHandler(e: MouseEvent) {
        if (leaved && isDrawing) {
            if (ctx) {
                ctx.stroke()
                ctx.moveTo(e.offsetX, e.offsetY);
            }
        }
        leaved = false;
    }

    function leaveHandler() {
        leaved = true;
    }

    function keyDownHandler(e: KeyboardEvent) {
        if (pressedKeys.has(e.key.toLowerCase()) == false) {
            pressedKeys.add(e.key.toLowerCase());
            // check cmd+z & cmd+shift+z
            if (pressedKeys.has("z") && pressedKeys.has("meta")) {
                if (pressedKeys.has("shift")) {
                    reRollback();
                } else {
                    rollback();
                }
            } else if (pressedKeys.has("meta") && pressedKeys.has("s")) {
                // check cmd+s
                downloadFullCanvas();
            } else if (pressedKeys.has("meta") && pressedKeys.has("i")) {
                // check cmd+i
            }
        }


    }

    function keyUpHandler(e: KeyboardEvent) {
        pressedKeys.delete(e.key.toLowerCase());
    }

    function moveHandler(e: MouseEvent) {
        if (isDrawing) {
            if (ctx) {
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke(); 
            }
        }
    }

    function downHandler(e: MouseEvent) {
        isDrawing = true;
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        }
    }

    function upHandler() {
        isDrawing = false;
        if (ctx) {
            if (datas.length - 1 != datasCursor) {
                datas = datas.slice(0, datasCursor + 1);
            }

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            datas.push(data);
            datasCursor++;
            ctx.closePath();
        }
    }

    async function rollback() {
        if (ctx && datasCursor != 0) {
            const prevData = datas[datasCursor - 1];
            datasCursor--;
            ctx.clearRect(0,0,canvas.width, canvas.height);
            await tick();
            ctx.putImageData(prevData, 0, 0);
        }

    }

    async function reRollback() {
        if (datas.length > datasCursor + 1) {
            if (ctx) {
                const DATA = datas[datasCursor + 1];
                datasCursor++;
                ctx.clearRect(0,0,canvas.width, canvas.height);
                await tick();
                ctx.putImageData(DATA, 0, 0);
            }
        }
    }

    export function updateColor() {
        if (ctx) {
            ctx.strokeStyle = `rgb(${color.red},${color.green},${color.blue})`;
        }
    }

    export function updateLineWidth() {
        if (ctx) {
            ctx.lineWidth = lineWidth;
        }
    }

    async function resizeCanvas() {
        if (!canvas) return;
        const backupData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (ctx) {
            ctx.lineWidth = lineWidth;
            updateColor();
            if (backupData) {
                ctx.putImageData(backupData, 0, 0);
            }
        } else {
            console.log("NO CTX");
        }
    }

    function downloadFullCanvas() {
        if (!canvas) return;
        
        canvas.toBlob(async (blob) => {
            if (blob) {
                try {
                    // Convert blob to base64
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64Data = reader.result as string;
                        
                        // Call Tauri command
                        const result = await invoke('save_image', {
                            request: {
                                image_data: base64Data,
                                filename: `paint_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
                            }
                        });
                        
                        console.log('Image saved:', result);
                        alert('이미지가 데스크톱에 저장되었습니다!');
                    };
                    reader.readAsDataURL(blob);
                } catch (error) {
                    console.error('Save error:', error);
                    alert('이미지 저장에 실패했습니다!');
                }
            }
        }, "image/png");
    }
    onMount(() => {
        ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.lineWidth = lineWidth;
            updateColor();
            datas.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            datasCursor++;
        } else {
            console.log("Failed to load ctx.");
        }

        resizeCanvas();
        window.addEventListener("mouseup", () => {
            upHandler();
        });

        window.addEventListener("keydown", (e) => {
            keyDownHandler(e);
        });

        window.addEventListener("keyup", (e) => {
            keyUpHandler(e);
        });

        window.addEventListener("resize", resizeCanvas);
    });
</script>

<div>
    <canvas
    bind:this={canvas}
    on:mouseenter={(e) => {enterHandler(e)}}
    on:mousemove={(e) => {moveHandler(e)}}
    on:mousedown={(e) => {downHandler(e)}}
    on:mouseleave={(e) => {leaveHandler()}}
    >
    </canvas>
</div>