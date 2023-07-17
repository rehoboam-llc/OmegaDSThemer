import {
    ColorsMap,
    checkOmegaDSAvailable,
    fetchJSONColors,
    changeDeep,
    loadTeamPaintStyles
} from "./funcs";

figma.showUI(__html__, { width: 380, height: 340, themeColors: true });

let colorsMapGlobal: ColorsMap = {};
let localMap: ColorsMap = {}

const loadColorStyles = (token: String) => {
    fetchJSONColors(token)
        .then((file: ColorsMap) => {
            colorsMapGlobal = file;
            // localMap = loadTeamPaintStyles(colorsMapGlobal);
            figma.ui.postMessage({
                type: 'stop-loading'
            });
        })
}

figma.clientStorage.getAsync('token')
    .then(token => {
        if (token) {
            figma.ui.postMessage({type: 'loading'});
            loadColorStyles(token);

        } else {
            figma.ui.postMessage({type: 'token-needed'})
        }
    })

figma.ui.onmessage = msg => {
    if (msg.type === 'switch-theme') {
        figma.clientStorage.getAsync('token')
            .then(token => {
                if (token !== undefined) {
                    let selection = figma.currentPage.selection;
                
                    if (selection.length > 0) {
                        for (const selected of selection) {
                            changeDeep(selected, colorsMapGlobal)
                        }
    
                    } else {
                        figma.notify("Выберите компонент или фрейм, в котором нужно переключить тему. Можно сразу несколько 😮", { error: true })
                    }

                } else {
                    figma.notify("Введите ваш персональный токен. Его можно найти в руководстве Omega DS", { error: true })
                }
            })
    }

    if (msg.type === 'provide-token') {
        let token = msg.token;

            if (token !== undefined) {
                figma.clientStorage.setAsync('token', token)
                    .then(() => {
                        figma.ui.postMessage({type: 'loading'});
                        loadColorStyles(token);
                    });

            } else {
                figma.notify("Введите ваш персональный токен. Его можно найти в руководстве Omega DS", { error: true })
            }
    }
};
