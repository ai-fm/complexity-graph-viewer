import { render } from "preact";
import MDPApp from "./MDPApp";
import { GraphManager } from "./graph_nodes/GraphManager";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<MDPApp />, document.getElementById("root")!);

//initialize graphmanager
export const graphMGR = new GraphManager();

//initialize event handlers
let mousedown = false

onmousedown = (event) => {
    mousedown = true
    graphMGR.handleMouseDownEvent(event)
}

onmouseup = () => {
    mousedown = false;

}

onmousemove = (event) => {
    if (mousedown) { graphMGR.handleMouseMoveEvent(event) }
}

//load correct graph view controller into graphmanager
graphMGR.fetchGVC()
console.log(graphMGR.gvc, "gvcaaaaaaa")
//load initial graph
graphMGR.generateGraphItems()