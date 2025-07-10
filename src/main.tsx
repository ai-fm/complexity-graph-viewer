import { render } from "preact";
import MDPApp from "./MDPApp";
import { GraphManager } from "./graph_nodes/GraphManager";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<MDPApp />, document.getElementById("root")!);

//initialize graphmanager
export const graphMGR = new GraphManager();

//initialize event handlers
let mousedown = false

export function p(...t: (number | string)[]) { console.log(t) }

onmousedown = (event) => {
    mousedown = true
    if ((event.target == graphMGR.gvc) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseDownEvent(event) }
}

onmouseup = () => {
    mousedown = false;

}

onmousemove = (event) => {
    if (mousedown) {
        if ((event.target == graphMGR.gvc) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseMoveEvent(event) }
    }
}

onwheel = (event) => {
    if ((event.target == graphMGR.gvc) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseWheelEvent(event) }
}

//load correct graph view controller into graphmanager
graphMGR.initGraphMGR()
//load initial graph
graphMGR.loadGraphElems(0);