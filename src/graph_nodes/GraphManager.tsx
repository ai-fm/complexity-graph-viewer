

import GraphNode, { moveGraphItem } from "./base_gnode";
import "./generate_graph.css";
export class GraphManager {
    xoffset = 0;
    yoffset = 0;
    lastX = 0;
    lastY = 0;
    zoom = 1;
    gvc: HTMLElement | null = null;
    gvc_rect: DOMRect | null = null;
    graphitems: HTMLCollectionOf<Element> | null = null;
    constructor() {
        console.log("created")
    }


    testattach(elem: HTMLElement | null) {
        const node = document.createElement("img")
        node.setAttribute("src", "temp_options_button.png")
        if (elem != null) { elem.appendChild(node) }
        console.log("Created ", node, " or should have.", elem)
    }

    generateGraph(mdptype: string) {
        if (mdptype == "MDP") {
            return (
                <div>
                    <GraphNode data={[20, [0, 1]]} />
                    <GraphNode data={[12, [10, 1]]} />
                </div>
            )


        }
    }

    fetchGVC() {
        this.gvc = document.getElementById("graphViewContainer");
        if (this.gvc != null) { this.gvc_rect = this.gvc.getBoundingClientRect(); }
        else { console.log(this.gvc, this.gvc_rect, "Something has gone very wrong; GraphManager gvc nonnul, gvcrect null") }
    }

    fetchGraphItems() {
        this.graphitems = document.getElementsByClassName("graphitem");
    }

    fetchIfNull() {
        if (this.gvc == null) { this.fetchGVC() }
        if (this.graphitems == null) { this.fetchGraphItems() }
    }

    handleMouseDownEvent(event: MouseEvent) {
        this.fetchIfNull()
        if ((this.gvc != null) && (this.gvc_rect != null)) {
            if ((this.gvc_rect.top < event.clientY) && (event.clientY < this.gvc_rect.bottom) && (this.gvc_rect.left < event.clientX) && (event.clientX < this.gvc_rect.right)) {
                this.lastX = event.clientX; this.lastY = event.clientY;

            }
        }
    }

    handleMouseMoveEvent(event: MouseEvent) {
        this.fetchIfNull()
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



/**import "./base_gnode.css";
export let moveGraphItem: (elem: Element, offsetX: number, offsetY: number, zoom: number) => void
export let nodeID: number;
let posX: number;
let posY: number;
 
export default function GraphNode({ data }: { data: [number, [number, number]] }) {

    nodeID = data[0]
    posX = data[1][0]
    posY = data[1][1]
    let borderOffsetY
    let borderOffsetX



    return (<div>
        <img draggable={false} class="graphitem" src="temp_options_button.png" style={"left:" + posX + "px;right:" + posY + "px"} />
        {
            //Implement zoom later (maybe), currently elem size bound by viewport
            moveGraphItem = (elem: Element, offsetX, offsetY, zoom) => {//, zoom) => {
                const h_elem = (elem as HTMLElement)
                console.log(zoom, "temp zoom output so build goes through, remove when zoom implemented")
                //console.log("a", offsetX, offsetY)
                if (document.getElementById("graphViewContainer") != null) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    borderOffsetX = document.getElementById("graphViewContainer")!.getBoundingClientRect().x
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    borderOffsetY = document.getElementById("graphViewContainer")!.getBoundingClientRect().y
                }
                borderOffsetX ??= 18.440 + 3.2
                borderOffsetY ??= 18.440 + 3.2
                h_elem.style.left = (posX - borderOffsetX + offsetX) + "px";
                h_elem.style.top = (posY - borderOffsetY + offsetY) + "px";
               


            }}
    </div>)



}*/