import { render } from "preact";

import { graphMGR, initialise_singletons, mdpAPP, optionsCTR, optionsOpen, p, setMouseDown } from "./global";


// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<main id="render" />, document.getElementById("root")!);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const renderRoot = document.getElementById("render")!

//initialize singletons
initialise_singletons(renderRoot)

onmousedown = () => {
    setMouseDown(true)
}

onmouseup = () => {
    setMouseDown(false)
}

onmousemove = (event) => {
    if (((event.target == mdpAPP.gvc.parentNode)
        || (event.target == mdpAPP.gvc)
        || (event.target == graphMGR.cnv))) {
        if (!optionsOpen) {
            graphMGR.handleMouseMoveEvent(event)
        } else {
            optionsCTR.handleDivMovement(event)
        }
    }
    if (graphMGR.graphitems.includes(event.target as HTMLElement)) {
        if (!optionsOpen) {
            graphMGR.handleMouseMoveEvent(event)
        }
        else {
            optionsCTR.handleElemMovement(event)
        }
    }
}

onwheel = (event) => {
    if ((event.target == mdpAPP.gvc.parentNode) || (event.target == mdpAPP.gvc) || (event.target == graphMGR.cnv) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseWheelEvent(event) }
}


//load initial graph
graphMGR.loadGraphElems(0);
//initialize the options menu
optionsCTR.initOptions()
//debug for location pings and prints
document.onclick = (event) => {
    p(event.x, event.y)
}


/*
function makeJSONDict(response: string) { return JSON.parse(JSON.stringify(JSON.parse(response))) }

//debug function for testing external cfgs on hosted page

const debugURL = 'https://raw.githubusercontent.com/ClemRub/debug/main/index.json'
const test = []
function getConfigURLs(indexURL: string) {
    const URLs: string[] = []
    const xhr = new XMLHttpRequest();
    xhr.open('GET', indexURL, false);
    xhr.onload = () => {
        const index = makeJSONDict(xhr.responseText)
        let cfgs = []
        const x = "configs";
        if (x in index) { cfgs = index[x] }
        else { p("Index malformed: No configs") }
        for (const i in cfgs) {
            const y = "dir";
            if (y in index) {
                test.push(cfgs[i])
                URLs.push(index[y] + cfgs[i])
            }
            else { p("Index malformed: No directory") }
        }
    };
    xhr.send();
    return URLs
}


function getConfigs(indexURL: string) {
    const CFGs: {
        graphtype: string;
        nodes: graphDataNode[],
        connectors?: {
            idFrom: string,
            idTo: string,
            type: string
        }[];
    }[]//|all[]|other[]|index[]|cfgs[]
        = []
    const URLs = getConfigURLs(indexURL)
    for (const i of URLs) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', i, false);
        xhr.onload = () => {
            if (xhr.responseText != "404: Not Found") {
                CFGs.push(JSON.parse(xhr.responseText))
            }
            else { p("Error:That config doesnt seem to exist.") }
        };
        xhr.send();
    }
    return CFGs
}

export const debugthing = getConfigs(debugURL)
//debugsetgraphstruct(debugthing)
//graphMGR.updateGraphType("MDP")



const xhr = new XMLHttpRequest();
xhr.open('GET', "https://raw.githubusercontent.com/ai-fm/complexity-graph-viewer/refs/heads/main/configs/valid_values/node-category-values.json?token=GHSAT0AAAAAADNEBIBFA5GVXIMGKOOPVPX62HQ7HPQ"
    , false);
xhr.onload = () => {
    if (!xhr.responseText.includes("404")) {

        p(makeJSONDict(xhr.responseText))
        p("This url resets in 7 days. Public URLs don't.")

    }
    else if (xhr.responseText.includes("404")) { p("Link expired or the like, 404") }
};
xhr.send();*/