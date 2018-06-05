const convertMenu = (list:Array<{label: string, items: Array<string>}>) =>
    list.map(({label, items}) => ({
        label,
        items: items.map(item => [item, item])
    }));

export const COMBINED_MENUS = convertMenu([
    {
        label: "COMBOS",
        items: [
            "COMBO1"
        ]
    },
]);

