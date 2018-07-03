const convertMenu = (list:Array<{label: string, items: Array<string>}>) =>
    list.map(({label, items}) => ({
        label,
        items: items.map(item => [item, item])
    }));

export const COMPLEX_MENUS = convertMenu([
    {
        label: "WORLDS",
        items: [
            "DUAL_GLTF",
        ]
    },
    {
        label: "LIGHTING",
        items: [
            "LIGHTING_PUNCTUAL"
        ]
    },
    {
        label: "INTERACTIVE",
        items: [
            "INTERACTIVE_OBJECTS"
        ]
    },
]);

