import { render } from "preact";
import MDPApp from "./MDPApp";
import { GraphManager } from "./graph_nodes/GraphManager";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<MDPApp />, document.getElementById("root")!);

//initialize graphmanager
export const graphMGR = new GraphManager();

//initialize event handlers
let mousedown = false

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
document.onclick = (event) => { p(event.x, event.y) }
