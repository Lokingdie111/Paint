export class Color {
    red: number;
    green: number;
    blue: number;

    constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    static withHex(hexCode: string): Color {

        hexCode = hexCode.replace("#", "");
        const red  = parseInt(hexCode.substring(0, 2), 16);
        const green  = parseInt(hexCode.substring(2, 4), 16);
        const blue  = parseInt(hexCode.substring(4, 6), 16);
        console.log(red, green, blue);
        return new Color(red, green, blue);
    }
}