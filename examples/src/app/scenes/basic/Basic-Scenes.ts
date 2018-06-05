
const convertMenu = (list:Array<{label: string, items: Array<string>}>) =>
    list.map(({label, items}) => ({
        label,
        items: items.map(item => [item, item])
    }));

export const BASIC_MENUS = convertMenu([
    {
        label: "Geometry",
        items: [
            "BOX_BASIC",
            "BOX_VAO"
        ]
    },
    {
        label: "Textures",
        items: [
            "QUAD",
            "TEXTURES_COMBINED",
            "SPRITESHEET"
        ]
    },
    {
        label: "Video",
        items: [
            "VIDEO_QUAD"
        ]
    }
]);

