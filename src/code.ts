import {
    ColorsMap,
    checkOmegaDSAvailable,
    fetchJSONColors,
    changeDeep,
    loadTeamPaintStyles
} from "./funcs";

figma.showUI(__html__, { width: 380, height: 340, themeColors: true });

checkOmegaDSAvailable()

let colorsMapGlobal: ColorsMap = {};
let localMap: ColorsMap = {}

const loadColorStyles = () => {
    fetchJSONColors()
        .then((file: ColorsMap) => {
            colorsMapGlobal = file;
            // localMap = loadTeamPaintStyles(colorsMapGlobal);
            figma.ui.postMessage({
                type: 'stop-loading'
            });
        })
}

loadColorStyles()

figma.ui.onmessage = msg => {
    switch (msg.type) {
        case 'switch-theme': {
            let selection = figma.currentPage.selection;
            
            if (selection.length > 0) {
                for (const selected of selection) {
                    changeDeep(selected, colorsMapGlobal)
                }

            } else {
                figma.notify("Выберите компонент или фрейм, в котором нужно переключить тему. Можно сразу несколько 😮", { error: true })
            }
        }
    }
};
