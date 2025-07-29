<script lang="ts">
    import { onMount, tick } from "svelte";
    import { Color } from "$lib/Color"
    import { saveImage } from "$lib/SaveImage";
    import { importImage } from "$lib/ImportImage";

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
        color;
        lineWidth;
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
            // check cmd+z
            if (pressedKeys.has("z") && pressedKeys.has("meta")) {
                if (pressedKeys.has("shift")) {
                    reRollback();
                } else {
                    rollback();
                }
                pressedKeys.clear();
            } else if (pressedKeys.has("meta") && pressedKeys.has("s")) {
                canvas.toBlob((blob) => {
                    if (blob) {
                        saveImage(blob);
                    } else {
                        console.log("FAILED TO GET BLOB DATA...");
                    }
                }, "image/png");
                pressedKeys.clear();
            } else if (pressedKeys.has("meta") && pressedKeys.has("e")) {
                importImage((blob) => {
                    const imgURL = URL.createObjectURL(blob);
                    let img = new Image();
                    img.src = imgURL;
                    img.onload = () => {
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            console.log("IMage drawed.");
                            URL.revokeObjectURL(imgURL);
                        } else {
                            console.log("NO CTX.");
                        }
                    };

                });
                pressedKeys.clear();
            }
        }


    }

    function keyUpHandler(e: KeyboardEvent) {
        pressedKeys.delete(e.key.toLowerCase());
    }

    function moveHandler(e: MouseEvent) {
        if (isDrawing) {
            console.log("MOUSE MOVE!");
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
            console.log("ROLLBACK", datas, datasCursor);
            const prevData = datas[datasCursor - 1];
            datasCursor--;
            ctx.fillRect(0,0,canvas.width, canvas.height);
            await tick();
            ctx.putImageData(prevData, 0, 0);
        }

    }

    async function reRollback() {
        if (datas.length > datasCursor + 1) {
            if (ctx) {
                const DATA = datas[datasCursor + 1];
                datasCursor++;
                ctx.fillRect(0,0,canvas.width, canvas.height);
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
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            updateColor();
            if (backupData) {
                ctx.putImageData(backupData, 0, 0);
            }
        } else {
            console.log("NO CTX");
        }
    }
    onMount(() => {
        ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.lineWidth = lineWidth;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
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