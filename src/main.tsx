import { render } from "preact";
import MDPApp from "./MDPApp";
import { GraphManager } from "./graph_nodes/GraphManager";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<MDPApp />, document.getElementById("root")!);

//initialize graphmanager
export const graphMGR = new GraphManager();

//initialize event handlers
let mousedown = false
let optionsOpen = false
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function p(...t: any[]) { console.log(t) }

onmousedown = () => {
    mousedown = true
    //if ((event.target == graphMGR.gvc) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseDownEvent(event) }
}

onmouseup = () => {
    mousedown = false;

}

onmousemove = (event) => {
    if ((event.target == graphMGR.gvc?.parentNode) || (event.target == graphMGR.gvc) || (event.target == graphMGR.cnv) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseMoveEvent(event, mousedown) }

}

onwheel = (event) => {
    if ((event.target == graphMGR.gvc?.parentNode) || (event.target == graphMGR.gvc) || (event.target == graphMGR.cnv) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseWheelEvent(event) }
}

//load correct graph view controller into graphmanager
graphMGR.initGraphMGR()
//load initial graph
graphMGR.loadGraphElems(0);

const optionsButton = document.getElementById("settingsicon")
//
//
//
// TIDY UP ! MAYBE MERGE APP INTO THIS BY GENERATNG ALL FROM CODE?
//  Otherwise make this subclass for options
//
//
let optionsDiv = document.getElementById("optionsContainer")
optionsDiv ??= document.createElement("div")
optionsDiv.setAttribute("id", "optionsContainer")
optionsDiv.style.display = optionsOpen ? "block" : "none"
optionsDiv.style.overflow = "hidden"

export function closeOptions() {
    if (document.getElementById("optionsContainer") != null) {
        optionsOpen = false;
        document.getElementById("optionsContainer")!.style.display = optionsOpen ? "block" : "none"
    }
}

let isOptionsInit = false

let container = document.getElementById("filterAndDataContainer")
container!.prepend(optionsDiv)
optionsButton!.onclick = (event) => {
    optionsOpen = !optionsOpen
    if (optionsOpen) {
        graphMGR.undisplayNodeData()
        container!.style.overflowY = "hidden"
        container!.style.overflowX = "hidden"
        if (!isOptionsInit) {
            //lateron this will be a submenu next to other settings, accessed by a button. Right now its gonna be the only setting
            optionsSubmenuEditGraph(optionsDiv)


            isOptionsInit = true;
        }
    }
    optionsDiv.style.display = optionsOpen ? "block" : "none"
}


function optionsSubmenuEditGraph(optionsBorder: HTMLElement) {

    optionsBorder.appendChild(document.createElement("button"))
    optionsBorder.appendChild(document.createElement("button"))

}

document.onclick = (event) => {
    //p(event.x, event.y)

    //graphMGR.download("debug.json")

}
