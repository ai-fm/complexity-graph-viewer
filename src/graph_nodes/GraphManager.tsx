import "./graph_nodes.css";

export class GraphManager {
    xoffset = 0;
    yoffset = 0;
    lastX = 0;
    lastY = 0;
    zoom = 1;
    borderOffsetY = 18.440 + 3.2;
    borderOffsetX = 18.440 + 3.2;

    gvc: HTMLElement | null = null;
    gvc_rect: DOMRect | null = null;
    graphitems: HTMLCollectionOf<Element> | null = null;
    graphitemdata: number[][] = [[]];
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
            if (this.gvc != null) { this.gvc_rect = this.gvc.getBoundingClientRect(); }
            else { console.log(this.gvc, this.gvc_rect, "Something has gone very wrong; GraphManager gvc nonnul, gvcrect null") }
        }
    }

    generateGraphItems() {
        //null check to ensure everything is in order
        console.log("a")
        if (this.gvc == null) { return }
        console.log("aa")
        const nodeTest = document.createElement("img")
        nodeTest.setAttribute("draggable", "false")
        nodeTest.setAttribute("class", "graphitem")
        nodeTest.setAttribute("src", "temp_options_button.png")
        nodeTest.setAttribute("style", "left: " + this.elemposX + "px;right: " + this.elemposY + "px")
        console.log("nodetest", nodeTest)
        this.gvc.appendChild(nodeTest)
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

    moveGraphItem(elem: Element) {
        const h_elem = (elem as HTMLElement)
        if (this.gvc != null) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.borderOffsetX = document.getElementById("graphViewContainer")!.getBoundingClientRect().x
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.borderOffsetY = document.getElementById("graphViewContainer")!.getBoundingClientRect().y

            h_elem.style.left = (this.elemposX - this.borderOffsetX + this.xoffset) + "px";
            h_elem.style.top = (this.elemposY - this.borderOffsetY + this.yoffset) + "px";
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
                    this.moveGraphItem(i);
                }
            }
        }
    }


}