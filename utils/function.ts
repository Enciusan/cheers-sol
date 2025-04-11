

export const convertToStringFromHex = (item: string) => {
    return Buffer.from(item, "hex");
}