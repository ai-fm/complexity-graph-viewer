import "./base_gnode.css";
export let moveGraphItem: (elem: Element, offsetX: number, offsetY: number, zoom: number, border: DOMRect) => void
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
            moveGraphItem = (elem: Element, offsetX, offsetY, zoom, border) => {//, zoom) => {
                const h_elem = (elem as HTMLElement)
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
                if ((border.top < (posY + offsetY)) && ((posY + offsetY) < border.bottom) && (border.left < (posX + offsetX)) && ((posX + offsetX) < border.right)) {
                    h_elem.style.visibility = "visible"
                }
                else {
                    h_elem.style.visibility = "hidden"
                }


            }}
    </div>)



}