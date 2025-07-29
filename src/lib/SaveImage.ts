import { create } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

export async function saveImage(blob: Blob) {

    // get file path to save by file dialog.
    const PATH = await save({
        filters: [
            {name: "PNG Image", extensions: ["png"]},
        ],
    });

    if (PATH) {

        // Make file descripter.
        const file = await create(PATH);

        // Get Blob data by array.
        const blobBuffer = await blob.arrayBuffer();

        // cast to UInt8Array and write.
        await file.write(new Uint8Array(blobBuffer));

        // Close descripter.
        await file.close();

    } else {
        console.log("FAILED TO GET PATH...");
    }
}