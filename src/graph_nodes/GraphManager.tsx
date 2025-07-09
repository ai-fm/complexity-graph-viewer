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
    graphitemdata: (number | string)[][] = [[0, 0, "test"], [50, 50, "err"], [250, 250, "test"]]; //posX,posY,nodetype. values debug, to be loaded from json
    graphtype = "MDP";


    elemposX = 0; elemposY = 0; //temp

    constructor() {
        console.log("created")
    }


    setGraphType(type: string) {
        this.graphtype = type;
    }

    loadGraphElems() {
        if (this.graphtype == "MDP") {
            this.generateGraphItems();
        }
    }

    fetchGVC() {
        if (this.gvc == null) {
            this.gvc = document.getElementById("graphViewContainer");
            if (this.gvc != null) { this.gvc_rect = this.gvc.getBoundingClientRect() }
            else { console.log(this.gvc, this.gvc_rect, "Something has gone very wrong; GraphManager gvc nonnul, gvcrect null") }
        }
    }

    makeTestNode(X: number, Y: number, type: string) {
        if (this.gvc == null) { return }
        let nodeTest: HTMLElement
        if (type == "test") {
            nodeTest = document.createElement("img")
            nodeTest.setAttribute("draggable", "false")
            nodeTest.setAttribute("class", "graphitem")
            nodeTest.setAttribute("src", "temp_options_button.png")
            nodeTest.setAttribute("style", "position:absolute;left: " + X + "px;top: " + Y + "px")
        }
        else { //use test as default case for invalid assignments
            nodeTest = document.createElement("img")
            nodeTest.setAttribute("draggable", "false")
            nodeTest.setAttribute("class", "graphitem")
            nodeTest.setAttribute("src", "temp_options_button.png")
            nodeTest.setAttribute("style", "position:absolute;left: " + X + "px;top: " + Y + "px")
        }

        this.gvc.appendChild(nodeTest)
        this.graphitems.push(nodeTest)

    }

    generateGraphItems() {
        for (const i of this.graphitemdata) {

            const elemX = i[0] as number;
            const elemY = i[1] as number;
            const elemType = i[2] as string;
            this.makeTestNode(elemX, elemY, elemType);
        }
    }


    handleMouseDownEvent(event: MouseEvent) {
        this.fetchGVC()
        if ((this.gvc != null) && (this.gvc_rect != null)) {
            if ((this.gvc_rect.top < event.clientY) && (event.clientY < this.gvc_rect.bottom) && (this.gvc_rect.left < event.clientX) && (event.clientX < this.gvc_rect.right)) {
                this.lastX = event.clientX;
                this.lastY = event.clientY;
            }
        }
    }

    moveGraphItem(elem: Element, tempindex: number) {
        const h_elem = (elem as HTMLElement)
        if ((this.gvc != null) && this.gvc_rect != null) {
            const X = (this.graphitemdata[tempindex][0] as number)
            const Y = (this.graphitemdata[tempindex][1] as number)
            h_elem.style.left = (X + this.xoffset) + "px";
            h_elem.style.top = (Y + this.yoffset) + "px";
        }
    }


    handleMouseMoveEvent(event: MouseEvent) {
        this.fetchGVC()
        if ((this.gvc != null) && (this.graphitems != null) && (this.gvc_rect != null)) {
            if ((this.gvc_rect.top < event.clientY) && (event.clientY < this.gvc_rect.bottom) && (this.gvc_rect.left < event.clientX) && (event.clientX < this.gvc_rect.right)) {
                this.xoffset -= this.lastX - event.clientX;
                this.yoffset -= this.lastY - event.clientY;
                this.lastX = event.clientX; this.lastY = event.clientY;
                this.zoom *= 1;
                let temp = 0;
                for (const i of this.graphitems) {
                    this.moveGraphItem(i, temp); temp += 1;
                }
            }
        }
    }


}