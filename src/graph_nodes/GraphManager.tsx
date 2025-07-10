import graphStructures from "../complexity_graph_configs/graphindex";
import { p } from "../main";
import "./graph_nodes.css";

export class GraphManager {
    xoffset = 0;
    yoffset = 0;
    lastX = 0;
    lastY = 0;
    zoom = 1;

    gvc: HTMLElement | null = null;
    gvc_rect: DOMRect | null = null;
    graphitems: HTMLElement[] = [];//HTMLCollectionOf<Element> | null = null;
    graphitemdata: (number | string)[][] = [];//[0, 0, "test"], [50, 50, "err"], [250, 250, "test"]]; //posX,posY,nodetype. values debug, to be loaded from json

    validGraphTypes: string[] = [];
    graphtype = this.validGraphTypes[0];


    constructor() {
        p("created")
    }



    updateGraphType(type: string) {
        if (this.validGraphTypes.includes(type)) {
            this.xoffset = 0;
            this.yoffset = 0;
            this.lastX = 0;
            this.lastY = 0;
            this.zoom = 1;
            this.graphtype = type;
            for (const i in this.graphitems) {
                this.graphitems[i].remove()
            }
            this.graphitems = []
            this.graphitemdata = []
            this.loadGraphElems(this.validGraphTypes.indexOf(type));
        }
        else { console.log("Graph type doesnt have corresponding graph!") }
    }



    loadGraphElems(typeIndex: number) {
        for (const i in graphStructures[typeIndex].nodes) {
            const elemX = graphStructures[typeIndex].nodes[i].posX;
            const elemY = graphStructures[typeIndex].nodes[i].posY;
            const elemType = graphStructures[typeIndex].nodes[i].type;
            this.graphitemdata.push([elemX, elemY, elemType]);
            this.makeTestNode(elemX, elemY, elemType);
        }
    }

    initGraphMGR() {
        //init gvc
        if (this.gvc == null) {
            this.gvc = document.getElementById("graphViewContainer");
            if (this.gvc != null) { this.gvc_rect = this.gvc.getBoundingClientRect() }
            else { console.log(this.gvc, this.gvc_rect, "Something has gone very wrong; GraphManager gvc nonnul, gvcrect null") }
        }
        //init valid graphtypes
        for (const i in graphStructures) {
            this.validGraphTypes.push(graphStructures[i].graphtype)
        }

        //https://barker.codes/blog/unique-array-values-in-javascript/#check-if-every-value-is-unique
        //checking is all MDP graph types are unique and if not throwing error (but continuing as normal, using first occurance of graph for every)
        if (!(this.validGraphTypes.every((value, _index, array) => { return array.indexOf(value) === array.lastIndexOf(value); }))) {
            console.log("Not all graph types are unique!")
        }
    }

    makeTestNode(X: number, Y: number, type: string) {
        if (this.gvc == null) { return }
        let nodeTest: HTMLElement
        if (type == "circle") {
            nodeTest = document.createElement("img")
            nodeTest.setAttribute("draggable", "false")
            nodeTest.setAttribute("class", "graphitem")
            nodeTest.setAttribute("src", "./src/graph_nodes/node_genericcircle.png")
            nodeTest.setAttribute("style", "position:absolute;left: " + X + "px;top: " + Y + "px")
        }
        else { //use test as default case for invalid assignments
            nodeTest = document.createElement("img")
            nodeTest.setAttribute("draggable", "false")
            nodeTest.setAttribute("class", "graphitem")
            nodeTest.setAttribute("src", "temp_options_button.png")
            nodeTest.setAttribute("style", "position:absolute;left: " + X + "px;top: " + Y + "px")
        }
        console.log(nodeTest.getAttribute("class"))
        this.gvc.appendChild(nodeTest)
        this.graphitems.push(nodeTest)

    }

    handleMouseDownEvent(event: MouseEvent) {
        if ((this.gvc != null) && (this.gvc_rect != null)) {
            //if ((this.gvc_rect.top < event.clientY) && (event.clientY < this.gvc_rect.bottom) && (this.gvc_rect.left < event.clientX) && (event.clientX < this.gvc_rect.right)) {
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            //}
        }
    }

    moveGraphItem(elem: Element, index: number) {
        const h_elem = (elem as HTMLElement)
        if ((this.gvc != null) && (this.gvc_rect != null)) {
            const X = (this.graphitemdata[index][0] as number)
            const Y = (this.graphitemdata[index][1] as number)
            h_elem.style.left = this.zoom * (X + this.xoffset) + "px";
            h_elem.style.top = this.zoom * (Y + this.yoffset) + "px";
        }
    }


    handleMouseMoveEvent(event: MouseEvent) {
        if ((this.gvc != null) && (this.gvc_rect != null) && (this.graphitemdata.length > 0)) {
            //if ((this.gvc_rect.top < event.clientY) && (event.clientY < this.gvc_rect.bottom) && (this.gvc_rect.left < event.clientX) && (event.clientX < this.gvc_rect.right)) {
            this.xoffset -= this.lastX - event.clientX;
            this.yoffset -= this.lastY - event.clientY;
            this.lastX = event.clientX; this.lastY = event.clientY;
            let ind = 0;
            for (const i of this.graphitems) {
                this.moveGraphItem(i, ind); ind += 1;

            }
            //}
        }
    }

    handleMouseWheelEvent(event: WheelEvent) {
        if (event.deltaY > 0) {
            this.zoom *= 1.1
        }
        else if (event.deltaY < 0) {
            this.zoom /= 1.1
        }
        const ev = new MouseEvent("mousemove", { clientX: this.lastX, clientY: this.lastY })

        this.handleMouseMoveEvent(ev);
    }
}