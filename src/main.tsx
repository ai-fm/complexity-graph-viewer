import { render } from "preact";
import { graphDataNode, GraphManager } from "./GraphManager";
import MDPApp from "./MDPApp";
import { optionsController } from "./optionsController";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<MDPApp />, document.getElementById("root")!);

//initialize graphmanager
export const graphMGR = new GraphManager();
export const optionsCTR = new optionsController();

//initialize event handlers
export let mousedown = false
export let optionsOpen = false
export function setOptionsOpen(isOpen: boolean) { optionsOpen = isOpen }

//shorthand print function to save time typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export function p(...t: any[]) { console.log(t) }

onmousedown = () => {
    mousedown = true
}

onmouseup = () => {
    mousedown = false;
}

onmousemove = (event) => {
    if (((event.target == graphMGR.gvc.parentNode)
        || (event.target == graphMGR.gvc)
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
    if ((event.target == graphMGR.gvc.parentNode) || (event.target == graphMGR.gvc) || (event.target == graphMGR.cnv) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseWheelEvent(event) }
}


//load initial graph
graphMGR.loadGraphElems(0);
//initialize the options menu
optionsCTR.initOptions()
//debug for location pings and prints
document.onclick = (event) => {
    p(event.x, event.y)
}



//debug function for testing external cfgs on hosted page

const debugURL = 'https://raw.githubusercontent.com/ClemRub/debug/main/index.json'
const test = []
function getConfigURLs(indexURL: string) {
    const URLs: string[] = []
    const xhr = new XMLHttpRequest();
    xhr.open('GET', indexURL, false);
    xhr.onload = () => {
        //yes, parse(string(parse)). this is intentional and how it works.
        const index = JSON.parse(JSON.stringify(JSON.parse(xhr.responseText)))
        let cfgs = []
        p(index)
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
graphMGR.updateGraphType("MDP")



const xhr = new XMLHttpRequest();
xhr.open('GET', "https://raw.githubusercontent.com/ai-fm/complexity-graph-viewer/refs/heads/main/mdp_configs/node-category-values.json?token=GHSAT0AAAAAADNEBIBEAMJLS77U6P7AU2TY2HQ62UA"
    , false);
xhr.onload = () => {
    if (xhr.responseText != "404: Not Found") {
        p(xhr.responseText)
    }
    else { p("Error:That config doesnt seem to exist.") }
};
xhr.send();