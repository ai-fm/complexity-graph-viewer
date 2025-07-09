import { moveGraphItem } from "./base_gnode";

//import GraphNode, { moveGraphItem } from "./base_gnode";
export class GraphManager {
    xoffset = 0;
    yoffset = 0;
    lastX = 0;
    lastY = 0;
    zoom = 1;
    gvc: HTMLElement | null = null;
    gvc_rect: DOMRect | null = null;
    graphitems: HTMLCollectionOf<Element> | null = null;
    graphitemdata: number[][] = [[]];
    graphtype = "MDP";

    constructor() {
        console.log("created")
    }


    setGraphType(type: string) {
        this.graphtype = type;
    }

    testattach(elem: HTMLElement | null) {
        const node = document.createElement("img")
        node.setAttribute("src", "temp_options_button.png")
        if (elem != null) { elem.appendChild(node) }
        console.log("Created ", node, " or should have.", elem)
    }

    loadGraphElems() {
        if (this.graphtype == "MDP") {
            //misnamed, for now. generating nodes in code starting now.
            this.generateGraphItems();
        }
    }

    fetchGVC() {
        if (this.gvc == null) {
            this.gvc = document.getElementById("graphViewContainer");
            if (this.gvc != null) { this.gvc_rect = this.gvc.getBoundingClientRect(); }
            else { console.log(this.gvc, this.gvc_rect, "Something has gone very wrong; GraphManager gvc nonnul, gvcrect null") }
        }
    }

    generateGraphItems() {
        this.graphitems = document.getElementsByClassName("graphitem");
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

    handleMouseMoveEvent(event: MouseEvent) {
        this.fetchGVC()
        if ((this.gvc != null) && (this.graphitems != null) && (this.gvc_rect != null)) {
            if ((this.gvc_rect.top < event.clientY) && (event.clientY < this.gvc_rect.bottom) && (this.gvc_rect.left < event.clientX) && (event.clientX < this.gvc_rect.right)) {
                this.xoffset -= this.lastX - event.clientX;
                this.yoffset -= this.lastY - event.clientY;
                this.lastX = event.clientX; this.lastY = event.clientY;
                this.zoom *= 1;
                for (const i of this.graphitems) {
                    moveGraphItem(i, this.xoffset, this.yoffset, this.zoom);
                }
            }
        }
    }


}