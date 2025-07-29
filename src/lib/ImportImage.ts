import { open } from "@tauri-apps/plugin-dialog"
import { readFile } from "@tauri-apps/plugin-fs";
export async function importImage(callback: (data: Blob) => void) {
    const PATH = await open({
        filters: [
            {name: "PNG Image", extensions: ["png"]}
        ]
    });
    if (PATH) {
        let rawData = await readFile(PATH);
        let blob = new Blob([rawData], {type: "image/png"});

        callback(blob);
    } else {
        console.log("Failed to get path.");
    }
}