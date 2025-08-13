import { render } from "preact";
import MDPApp from "./MDPApp";
import { GraphManager } from "./graph_nodes/GraphManager";
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
    if ((event.target == graphMGR.gvc?.parentNode) || (event.target == graphMGR.gvc) || (event.target == graphMGR.cnv) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseMoveEvent(event) }
}

onwheel = (event) => {
    if ((event.target == graphMGR.gvc?.parentNode) || (event.target == graphMGR.gvc) || (event.target == graphMGR.cnv) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseWheelEvent(event) }
}

//load correct graph view controller into graphmanager
graphMGR.initGraphMGR()
//load initial graph
graphMGR.loadGraphElems(0);
//initialize the options menu
optionsCTR.initOptions()
//debug for location pings and prints
document.onclick = () => {
    //p(event.x, event.y)
    //graphMGR.download("debug.json")
}
