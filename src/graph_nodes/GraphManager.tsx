
import rawValidCategories from "../../mdp_configs/node-category-values.json";
import rawGraphStructures from "../complexity_graph_configs/graphindex";
import { graphMGR, mousedown, optionsCTR, optionsOpen, p } from "../main";
import { nodes as resultNodes } from "../nodes/nodes";
import "./graph_nodes.css";
const validCategories = JSON.parse(JSON.stringify(rawValidCategories))
p("print import for quicker debug")


export class graphDataNode {
    posX?: number;
    posY?: number;
    type!: string;
    title?: string | null | undefined;
    id!: string;
    children?: graphDataNode[];
    childDegree?: number;
    valueType?: string
}

class complexityResult {
    mdpType!: string;
    problemType!: string;
    problemApproach!: string;
    problemNotes!: string;
    complexity!: string;
    complexitysuffix?: string;
    horizonType!: string;
    generalProofType!: string;
    proofNotes!: string;
    determinism?: string;
    dependence?: string;
    complexityNotes?: string;
}

const graphStructures: {
    graphtype: string;
    nodes: graphDataNode[],
    connectors?: {
        idFrom: string,
        idTo: string,
        type: string
    }[];
}[] = rawGraphStructures;


//GraphManager is responsible for handling construction, movement and unloading/loading of the graph elements.
export class GraphManager {
    //check if graphMGR is in edit mode
    editMode = false;
    //used in movement offset calculations for zoom to prevent "warping"
    lastX = 0;
    lastY = 0;
    //zoom factor for all graph  elements
    zoom = 1;
    //graph view container and its' bounding client rect. 
    gvc: HTMLElement
    gvc_rect: DOMRect
    //node data container for results
    ndc: HTMLElement
    //canvas for lines between nodes.
    cnv: HTMLCanvasElement | null = null;
    conns: { idFrom: string; idTo: string; type: string; }[] | undefined = undefined
    //currently active graph elements
    graphitems: HTMLElement[] = [];
    //stores button span elements that store their title, to avoid some of the issues that come with making it tied to textcontent (i.e. empty textcontent deleting child nodes, no space, etc)
    graphitemtext: HTMLElement[] = [];
    //positional data and other information about nodes. Read from json and applied to corresponding graphitems
    graphitemdata: graphDataNode[] = []
    //currently active node data elements
    nodeitems: HTMLElement[] = []
    //Graph types that can be rendered, read from complexity_graph_configs. 
    validGraphTypes: string[] = [];
    //current graph type. Initialized as first valid type, can alternatively be coded to "MDP" or probably to on initialisation fetch initial Dropdown element
    graphtype = "Unininitalized"

    constructor() {
        let candidate = document.getElementById("graphViewContainer");
        if (candidate == null) {
            p("throw placeholder standin print: gvc invalid"); candidate = document.createElement("p")
        }
        this.gvc = candidate
        this.gvc_rect = this.gvc.getBoundingClientRect()

        candidate = document.getElementById("InformationContainer");
        if (candidate == null) {
            p("throw placeholder standin print: ndc invalid"); candidate = document.createElement("p")
        }
        this.ndc = candidate


        for (const i of graphStructures) {
            for (const j of i.nodes) {
                let title = "error";
                if ((j.title != null) && (j.title != undefined)) { title = j.title }
                j.valueType = this.getValueTypeFromTitle(title)
            }
        }
    }




    ////
    //// Functions relating to inter-component-communication
    ////

    //extends given array by the graph types from layout configs.
    addMDPTypes(types: string[]) {
        return types.concat(this.validGraphTypes)
    }

    //remove all result entries currently displayed in the righthand window.
    undisplayNodeData() {
        for (const i of this.nodeitems) {
            i.remove()
        }
    }


    ////
    //// Event handlers
    ////

    //general mouse movement. 
    handleMouseMoveEvent(event: MouseEvent) {
        if (mousedown) {
            for (const i of this.graphitems) {
                if (!i.getAttribute("class")?.includes("child node")) {
                    i.style.left = (parseFloat(i.style.left) + event.movementX) + "px"
                    i.style.top = (parseFloat(i.style.top) + event.movementY) + "px"
                }
            }
            this.loadConnectors()
        }
    }




    // Move only the ghost class elements. Which should only be the last activated element.
    handleGhostMovement(node: HTMLElement, event: MouseEvent) {
        const offsetx = this.gvc.getBoundingClientRect().left + 0.5 * node.getBoundingClientRect().width + optionsCTR.currentGhostOffsetL
        const offsety = this.gvc.getBoundingClientRect().top + 0.5 * node.getBoundingClientRect().height + optionsCTR.currentGhostOffsetT
        node.style.left = (event.x - offsetx) / this.zoom + "px"
        node.style.top = (event.y - offsety) / this.zoom + "px"

        this.loadConnectors()
    }

    //general mouse wheel zoom
    handleMouseWheelEvent(event: WheelEvent) {
        this.zoom *= 1.1 ** Math.sign(-event.deltaY)
        this.gvc.style.scale = this.zoom + ""

        for (const i of this.graphitemdata) {
            const el = document.getElementById(i.id)
            if (el == null) { continue }
            if (i.type == "ClickableSubNode") {
                el.style.scale = "" + Math.min(1, this.zoom)
            }
            else {
                el.style.scale = "" + Math.max(1, 1 + Math.log(1 / this.zoom))//"" + 1 / this.zoom
            }
        }

        this.gvc.style.transformOrigin = ("")
        this.loadConnectors()
    }


    //// 
    //// Graph Viewer - Graph generation
    ////

    //Update graph type from one to another. Usually called from dropdown.
    updateGraphType(type: string) {
        if (this.validGraphTypes.includes(type)) {
            this.lastX = 0;
            this.lastY = 0;
            this.zoom = 1;
            this.graphtype = type;
            const ctx = this.cnv?.getContext("2d");
            if ((ctx != null) && (this.cnv != null)) { ctx.clearRect(0, 0, this.cnv.width, this.cnv.height) } else { p("unexpected canvas error") }
            this.unloadGraphItems()
            this.loadGraphElems(this.validGraphTypes.indexOf(type));
            return true
        }
        else { console.log("Graph type doesnt have corresponding graph!"); return false; }
    }

    //
    unloadGraphItems() {
        for (const i in this.graphitems) { this.graphitems[i].remove() }
        this.graphitems = []
        this.graphitemdata = []
    }

    //for a set graph type, fetch node data, add it to graphitemdata array and pass it on to createNode.
    //also checks for duplicate ids upon loading that graph in.
    loadGraphElems(typeIndex: number) {

        //init valid graphtypes
        for (const i in graphStructures) {
            this.validGraphTypes.push(graphStructures[i].graphtype)
        }

        //https://barker.codes/blog/unique-array-values-in-javascript/#check-if-every-value-is-unique
        //checking if all MDP graph types are unique and if not throwing error (but continuing as normal, using first occurance of graph for every)
        if (!(this.validGraphTypes.every((value, _index, array) => { return array.indexOf(value) === array.lastIndexOf(value); }))) {
            p("Not all graph types are unique!")
        }

        for (const i in graphStructures[typeIndex].nodes) { this.loadGraphElem(graphStructures[typeIndex].nodes[i]) }

        const ids = []
        for (const i of this.graphitemdata) {
            const id = i.id
            if (ids.indexOf(id) != -1) { p("Duplicate id: " + id) }
            ids.push(id)
        }

        this.cnv = document.createElement("canvas")
        let wt = this.gvc.parentElement?.getBoundingClientRect().width; let ht = this.gvc.parentElement?.getBoundingClientRect().height
        wt ??= 1; ht ??= 1

        this.cnv.height = ht
        this.cnv.width = wt
        this.cnv.style.position = "fixed"
        this.gvc.parentElement?.prepend(this.cnv)
        this.conns = graphStructures[typeIndex].connectors
        this.loadConnectors()
    }

    //Load in a given element by passing its information data to node data array and its graph element data to html element.
    loadGraphElem(elem: graphDataNode, parent?: HTMLElement) {
        //if (parent == null) {
        this.createNode(elem, parent);
        this.graphitemdata.push(elem);
        //}
        //else {
        // this.createNode(elem, parent);

        //}

    }

    //Given a nodes json data, initialise it based on its type.
    createNode(el: graphDataNode, pParent?: HTMLElement) {
        let parent = pParent
        parent ??= this.gvc
        const newNode = document.createElement("button")
        newNode.style.borderRadius = "45%"
        el.childDegree ??= 0
        newNode.style.transform = "scale(" + ((el.childDegree > 0) ? 0.75 : 1.5) + ")"

        //span to hold buttons text instead of button. avoids some issues.
        const txtspan = document.createElement("span")

        //display data on click. passed through handler.
        newNode.onclick = (event) => {
            //empty span failsafe [Buttons can get emptied out text and onchange and emptied functions dont seem to fire, so instead, putting it here]
            const sp = document.getElementById(newNode.id + "SP") //var for null check
            if (sp != null && sp.textContent == "") { sp.textContent = "<>"; }

            graphMGR.nodeOnClick(newNode, event);
        }
        //edit node content on dbclick. passed through handler, edit mode only
        newNode.ondblclick = (event) => { graphMGR.nodeOnDBLClick(newNode, event); }

        el.title ??= "Untitled"
        //if titled new, leave empty for user to name. Else, if invalid, add ""? to name to indicate so.
        txtspan.textContent = el.title == "new" ? "-" : this.getValueTypeFromTitle(el.title) == "Error" ? ("\"" + el.title + "\"?") : el.title

        if (el.children != null) { el.children.forEach((i) => this.loadGraphElem(i, newNode)) }
        newNode.style.display = "inline-block"
        newNode.style.width = "auto";
        newNode.setAttribute("class", newNode.getAttribute("class") + " graphitem")
        if (el.type == "ClickableSubNode") { newNode.setAttribute("class", newNode.getAttribute("class") + " child node") }
        newNode.setAttribute("draggable", "false")
        newNode.style.verticalAlign = "middle"
        newNode.style.position = "absolute"
        el.posX ??= 0; el.posY ??= 0;
        newNode.style.left = el.posX + "px"
        newNode.style.top = el.posY + "px"
        newNode.id = el.id
        txtspan.id = el.id + "SP"


        this.graphitems.push(newNode)
        parent.appendChild(newNode)

        this.graphitemtext.push(txtspan)
        newNode.appendChild(txtspan)
    }



    nodeOnClick(node: HTMLElement, event: MouseEvent) {
        if (!optionsOpen) { graphMGR.displayNodeData(node) }
        event.stopPropagation()
    }
    nodeOnDBLClick(node: HTMLElement, event: MouseEvent) {
        if (optionsOpen) {
            node.style.opacity = "0.5"
            optionsCTR.handleElemClick(node)

        }
        else {
            graphMGR.displayNodeData(node)
        }
        event.stopPropagation()
    }



    //loads in connecting lines between nodes.
    loadConnectors() {
        if ((this.cnv == null) || (this.conns == undefined)) { return }
        const ctx = this.cnv.getContext("2d");
        if (ctx == null) { p("Context is null"); return }
        ctx.clearRect(0, 0, this.cnv.width, this.cnv.height)

        //adapted from https://jsfiddle.net/m1erickson/86f4C/
        for (const conn of this.conns) {
            const connFrom = conn.idFrom;
            const connTo = conn.idTo;
            const elemFrom = document.getElementById(connFrom)
            const elemTo = document.getElementById(connTo)
            if ((elemFrom == null) || (elemTo == null)) { continue }
            const pos1 = elemFrom.getBoundingClientRect()
            //gvc left or top are inherent offset in gvc. Makes canvas thats otherwise unaffected by this offset work properly.

            const pos1centerX = (pos1.left + 0.5 * (pos1.right - pos1.left)) - this.gvc_rect.left
            const pos1centerY = (pos1.top + 0.5 * (pos1.bottom - pos1.top)) - this.gvc_rect.top
            const pos2 = elemTo.getBoundingClientRect()
            const pos2centerX = (pos2.left + 0.5 * (pos2.right - pos2.left)) - this.gvc_rect.left
            const pos2centerY = (pos2.top + 0.5 * (pos2.bottom - pos2.top)) - this.gvc_rect.top
            const connType = conn.type;
            if (connType == "arrow") {

                const vecX = (pos2centerX - pos1centerX) / ((pos2centerX - pos1centerX) + (pos2centerY - pos1centerY))
                const vecY = (pos2centerY - pos1centerY) / ((pos2centerX - pos1centerX) + (pos2centerY - pos1centerY))

                const angle = (Math.PI / 180) * 120
                const vecXL = Math.cos(angle) * vecX - Math.sin(angle) * vecY
                const vecYL = Math.cos(angle) * vecY + Math.sin(angle) * vecX
                const vecXR = Math.cos(-angle) * vecX - Math.sin(-angle) * vecY
                const vecYR = Math.cos(-angle) * vecY + Math.sin(-angle) * vecX

                const endPosLineX = pos2centerX - (vecX * 30 * this.zoom)
                const endPosLineY = pos2centerY - (vecY * 30 * this.zoom)
                const endPosX = pos2centerX - (vecX * 10 * this.zoom)
                const endPosY = pos2centerY - (vecY * 10 * this.zoom)
                const linePath = new Path2D("M " + pos1centerX + " " + pos1centerY + //start position
                    " L " + (endPosLineX) + " " + endPosLineY //end position, scaled
                )

                ctx.stroke(linePath);
                ctx.fill(new Path2D(
                    " M " + (endPosLineX) + " " + endPosLineY + //last end pos
                    " L " + (endPosLineX + (vecXL * 10 * this.zoom)) + " " + (endPosLineY + (vecYL * 10 * this.zoom)) +// left arrow point 
                    " L " + endPosX + " " + endPosY + //fin end pos
                    " L " + (endPosLineX + (vecXR * 10 * this.zoom)) + " " + (endPosLineY + (vecYR * 10 * this.zoom)) // right arrow point 

                ))
            }
            else if (connType == "line") {
                ctx.beginPath();
                ctx.moveTo(pos1centerX, pos1centerY);
                ctx.lineTo(pos2centerX, pos2centerY);
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.moveTo(pos1centerX, pos1centerY);
                ctx.lineTo(pos2centerX, pos2centerY);
                ctx.stroke();
            }

        }

    }

    ////
    //// Graph Viewer - active use functions
    ////

    findItemById(id: string): graphDataNode | undefined {
        for (const i of this.graphitemdata) {
            if (i.id == id) { return i }
        }
    }
    findTextElemById(id: string): HTMLElement | undefined {
        for (const i of this.graphitemtext) {
            if (i.id == (id + "SP")) { return i }
        }
    }


    //display json results for clicked nodes, if possible
    displayNodeData(node: HTMLElement) {
        //remove all "old" node info elements
        this.undisplayNodeData()

        //close the options menu if it currently is covering the right hand screen
        //if in edit mode this wont be able to be called, obviously
        this.ndc.style.overflowY = "scroll"
        this.ndc.style.overflowX = "hidden"
        this.ndc.style.textAlign = "left"
        optionsCTR.closeOptions()


        const nodeResults: complexityResult[] = [];
        const nodeResultTitles: string[] = [];
        this.fetchResults(node, this.graphtype, nodeResults, nodeResultTitles)
        if (nodeResults.length == 0) { this.makeparagraph("Sorry, no results found. You can add additional results in complexity_result_jsons\\json_directory following the guide template. Add them into the import list in index.ts, and the program should handle the rest.") }
        for (const i in nodeResults) {
            const ii = parseInt(i)
            this.makeresult(ii + 1, nodeResultTitles[i], nodeResults[i])
        }
    }


    fetchResults(node: HTMLElement, mdptype: string, nodeResults: complexityResult[], nodeResPapers: string[]) {

        const [filters, filtervalues] = this.recursiveFilter(node)
        p(filters, filtervalues)
        resultNodes.forEach((paperJson) => {
            paperJson.results.forEach((result) => {
                if (result.mdpType == mdptype) {
                    let validEntry = true
                    if (filters.includes("Error")) { validEntry = false }
                    for (const i in filters) {
                        const k = filters[i] as keyof typeof result
                        if (result[k] != filtervalues[i]) { validEntry = false }
                    }
                    if (validEntry) { nodeResPapers.push(paperJson.title); nodeResults.push(result) }
                }
            })
        })


    }
    recursiveFilter(node: HTMLElement): string[][] {


        const par = node.parentElement;
        let filters = [this.getValueTypeFromTitle(this.findItemById(node.id)?.title)]
        const candidate = this.findTextElemById(node.id)?.textContent
        let values: string[] = [(candidate == undefined) ? "error" : (candidate)]
        if (par != null && par != this.gvc) {
            const pfilt = this.recursiveFilter(par)
            filters = filters.concat(pfilt[0])
            values = values.concat(pfilt[1])
        }
        return [filters, values]
    }


    ////
    //// Generate output from a clicked graph node to be displayed in the righthand panel
    ////

    //make paragraph element containing text with optional <br> afterwards
    makeparagraph(text: string, makebreak?: boolean) {
        const para = document.createElement("p")
        para.setAttribute("class", "nodeDataDisplayElem")
        para.style.position = "relative"
        para.style.left = "10px"
        para.style.wordWrap = "break-word"
        para.textContent = text;
        this.ndc.append(para)
        this.nodeitems.push(para)
        if (makebreak) { this.makebreak() }

    }

    //make break element
    makebreak() {
        const br = document.createElement("br")
        br.setAttribute("class", "nodeDataDisplayElem")
        this.ndc.append(br)
        this.nodeitems.push(br)
    }

    //make horizontal divier line
    makehrule() {
        const hr = document.createElement("hr")
        hr.setAttribute("class", "nodeDataDisplayElem")
        this.ndc.append(hr)
        this.nodeitems.push(hr)
    }

    //Generate result entry from prior functions given a result.
    makeresult(resNumber: number, restitle: string, resData: complexityResult) {
        this.makeparagraph("Result " + resNumber + ", from \"" + restitle + "\":")
        this.makeparagraph("Problem: " + resData.problemType + ", " + resData.problemApproach)
        if (resData.determinism != undefined) { this.makeparagraph("Deterministic? : " + resData.determinism) }
        if (resData.dependence != undefined) { this.makeparagraph("Stationary?: " + resData.dependence) }
        this.makeparagraph("Horizon: " + resData.horizonType)
        const complexity = (resData.complexitysuffix == undefined) ? resData.complexity : resData.complexity + "-" + resData.complexitysuffix
        this.makeparagraph("Complexity: " + complexity)
        this.makeparagraph("General approach: " + resData.generalProofType)

        this.makehrule()
    }


    ////
    //// Generate JSON from currently visible graph 
    ////

    //For a node, convert its' data into a json. Children recursively get converted to json.
    fetchNodeJsonEntry(node: graphDataNode) {
        const childrenJson: graphDataNode[] = []
        if (node.children != undefined) {
            for (const i of node.children) { childrenJson.push(this.fetchNodeJsonEntry(i)) }
        }
        const title_unsafe = document.getElementById(node.id + "SP")?.textContent
        let title = "error"
        if (title_unsafe != undefined) { title = title_unsafe as string }
        const outDict = {
            posX: node.posX,
            posY: node.posY,
            type: node.type,
            title: title,//span text container of element
            id: node.id,
            children: childrenJson,
            childDegree: node.childDegree,
            valueType: this.getValueTypeFromTitle(title)
        }
        return outDict
    }

    getValueTypeFromTitle(title: string | undefined | null) {
        if (title == null || title == undefined) { return "Error" }
        let x: keyof typeof validCategories;
        for (x in validCategories) { for (const i of validCategories[x]) { if (i.includes(title)) { return x; } } }
        return "Error"

    }

    //Get JSON for the current graph as given by graphitemdata and conns (NOT VISIBLE GRAPH DIRECTLY)
    getGraphAsJson() {
        const nodeEntries: graphDataNode[] = []
        for (const i of this.graphitemdata) {
            if (i.type == "ClickableGraphNode") { nodeEntries.push(this.fetchNodeJsonEntry(i)) }
        }
        const outDict = {
            graphtype: document.getElementById("GraphTitleContainer")?.textContent,
            nodes: nodeEntries,
            connectors: this.conns
        }
        return outDict
    }

    //download json file with filename given by param. adjusted from stackoverflow answer.
    download(fileName: string) {
        const content = JSON.stringify(this.getGraphAsJson(), null, "\t");
        const a = document.createElement("a");
        const file = new Blob([content], { type: "text/json" });;
        a.href = URL.createObjectURL(file);
        a.download = fileName += ".json";
        a.click();
    }
}

