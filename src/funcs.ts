import { Buffer } from "buffer";

export interface ColorsMap {
    [name: string]: String
}

// Check if the Omega DS library is available in the Figma file
export const checkOmegaDSAvailable = async () => {

    let teamLibVars = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

    let omegaFound = false

    for (const lib of teamLibVars) {
        let name = lib.libraryName;
        if (name.includes('-omg-tokens')) {
            figma.ui.postMessage({
                type: 'show-ui'
            });
            omegaFound = true
            break
        }
    }

    if (!omegaFound) {
        figma.ui.postMessage({type: 'omega-needed'})
    }
};

export async function fetchJSONColors(token: String) {
    let owner = 'rehoboam-llc'
    let repo = 'omega'
    let path = 'omegaColors.json'

    return fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            method: "GET",
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${token}`
            }
        }
    )
        .then((res) => res.json())
        .then((d) => JSON.parse(Buffer.from(d.content, 'base64').toString('utf8')))
}

export function loadTeamPaintStyles(globalMap: ColorsMap): ColorsMap {
    let localMap: ColorsMap = {}

    for (const name in globalMap) {
        let styleId = globalMap[name];

        figma.importStyleByKeyAsync(styleId.toString())
            .then(style => {
                localMap[name] = style.id
            })
    }

    return localMap

}
export function changeDeep(node: any, colorsMapGlobal: ColorsMap) {

    let as_frame_node = node as FrameNode;

    let fillStyleId = as_frame_node.fillStyleId;
    let strokeStyleId = as_frame_node.strokeStyleId;

    let oldFillStyle = figma.getStyleById(fillStyleId.toString());
    let oldStrokeStyle = figma.getStyleById(strokeStyleId);

    if (oldFillStyle) {
        let fillName = oldFillStyle!.name;

        let newFillName = fillName;

        if (fillName.startsWith('light/')) {
            newFillName = fillName.replace('light/', 'dark/');

        } else if (fillName.startsWith('dark/')) {

            newFillName = fillName.replace('dark/', 'light/');
        }

        let newFill = colorsMapGlobal[newFillName];

        if (newFill) {
            let newFillKey = newFill;
            figma.importStyleByKeyAsync(newFillKey.toString())
                .then(style => {
                    let styleId = style.id;

                    try {
                        as_frame_node.fillStyleId = styleId.toString();

                    } catch (err) {
                        console.log('Error while setting a fill style: ', err)
                    }
                })
                .catch(err => err)
        }
    }

    if (oldStrokeStyle) {
        let strokeName = oldStrokeStyle!.name;
        let newStrokeName = strokeName;

        if (strokeName.startsWith('light/')) {
            newStrokeName = strokeName.replace('light/', 'dark/');

        } else if (strokeName.startsWith('dark/')) {
            newStrokeName = strokeName.replace('dark/', 'light/');
        }

        let newStroke = colorsMapGlobal[newStrokeName];

        if (newStroke) {
            let newStrokeKey = newStroke;
            figma.importStyleByKeyAsync(newStrokeKey.toString())
                .then(style => {
                    let styleId = style.id;

                    try {
                        as_frame_node.strokeStyleId = styleId.toString();
                    } catch (err) {
                        console.log('Error while setting a fill style: ', err)
                    }
                })
                .catch(err => err)
        }

    }

    let children = as_frame_node.children;

    if (children) {
        for (const child of children) {
            changeDeep(child, colorsMapGlobal)
        }
    }
}