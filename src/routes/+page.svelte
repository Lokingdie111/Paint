<script lang="ts">
    import { onMount } from "svelte";
    import CoreCanvas from "../component/CoreCanvas.svelte";
    import { Color } from "$lib/Color";

    let color = new Color(0, 0, 0);
    let lineWidth = 5;

    let colorPicker: HTMLInputElement;
    let lineSelection: HTMLSelectElement;

    function changeColor() {
        const hexColor = colorPicker.value;
        console.log(colorPicker.value, typeof colorPicker.value);

        color = Color.withHex(hexColor); 
    }

    function changeLinewidth() {
        const line = lineSelection.value;
        console.log(lineSelection.value, typeof lineSelection.value);

        lineWidth = parseInt(line, 10);
    }

    onMount(() => {
        colorPicker.addEventListener("input", () => {
            console.log("ColorPicker Selected!");
            changeColor();
        });
        lineSelection.addEventListener("input", () => {
            changeLinewidth();
        });
    });
</script>

<div>
    <div>
        <!--Tool bar-->
        <div>
            <div class="h-fit mx-left">
                <span>Select color</span>
                <input type="color" bind:this={colorPicker} class="border">
                <span>Brush size</span>

                <select bind:this={lineSelection}>
                    <option value="1">1</option>
                    <option value="3">3</option>
                    <option value="5" selected>5</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                </select>
            </div>

        </div>
    </div>
    <CoreCanvas lineWidth={lineWidth} color={color}></CoreCanvas>

</div>
