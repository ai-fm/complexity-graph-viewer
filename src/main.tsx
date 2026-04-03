import { render } from "preact";

import { optionsOpen, p, setMouseDown, initAll, validGraphTypes, currentGraphType } from "./global";
import { GraphManager } from "./GraphManager";
import { MDPApp } from "./MDPApp";
import { addOptions, MDPTypeDropdown } from "./MDPTypeDropdown";
import { optionsController } from "./optionsController";


// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<main id="render" />, document.getElementById("root")!);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const renderRoot = document.getElementById("render")!

//initialize all external data once
await initAll()


//initialize singletons instances
const mdpAPP = new MDPApp(renderRoot)
const graphMGR = new GraphManager(mdpAPP)



new MDPTypeDropdown(document.getElementById("MDPTypeDropdownContainer"), graphMGR)
const MDPTypes: string[] = (validGraphTypes.filter((elem: string) => !("TemplateNoGraph".includes(elem))))
addOptions(MDPTypes, document.getElementById("dropdownField"));


const optionsCTR = new optionsController(graphMGR);

graphMGR.setOptionsController(optionsCTR)

//load initial graph 
graphMGR.loadGraphElems(currentGraphType);
//initialize the options menu
//debug for location pings and prints
document.onclick = (event) => {
    p(event.x, event.y)
}

onmousedown = () => {
    setMouseDown(true)
}

onmouseup = () => {
    setMouseDown(false)
}

onmousemove = (event) => {
    if (!optionsOpen) {
        graphMGR.handleMouseMoveEvent(event)
    } else {
        optionsCTR.handleDivMovement(event)
    }

}

onwheel = (event) => {
    if ((event.target == mdpAPP.gvc.parentNode) || (event.target == mdpAPP.gvc) || (event.target == graphMGR.cnv) || (graphMGR.graphitems.includes(event.target as HTMLElement))) { graphMGR.handleMouseWheelEvent(event) }
}

