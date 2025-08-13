import validCategories from "../../mdp_configs/node-category-values.json";
import rawGraphStructures from "../complexity_graph_configs/graphindex";
import { graphMGR, mousedown, optionsCTR, p } from "../main";
import { nodes as resultNodes } from "../nodes/nodes";
import "./graph_nodes.css";
p("print import for quicker debug")


class graphDataNode {
    posX!: number;
    posY!: number;
    type!: string;
    title?: string;
    id!: string;
    children?: graphDataNode[];
    childDegree?: number;
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
    gvc: HTMLElement | null = null;
    gvc_rect: DOMRect | null = null;
    gvcoffset = this.gvc?.getBoundingClientRect().left
    //node data container for results
    ndc: HTMLElement | null = null;
    //canvas for lines between nodes.
    cnv: HTMLCanvasElement | null = null;
    conns: { idFrom: string; idTo: string; type: string; }[] | undefined = undefined
    //currently active graph elements
    graphitems: HTMLElement[] = [];
    //positional data and other information about nodes. Read from json and applied to corresponding graphitems
    graphitemdata: graphDataNode[] = []
    //currently active node data elements
    nodeitems: HTMLElement[] = []
    //Graph types that can be rendered, read from complexity_graph_configs. 
    validGraphTypes: string[] = [];
    //current graph type. Initialized as first valid type, can alternatively be coded to "MDP" or probably to on initialisation fetch initial Dropdown element
    graphtype = this.validGraphTypes[0];

    ////
    //// Initialise graph viewer correctly
    ////

    initGraphMGR() {
        //init gvc
        this.gvc = document.getElementById("graphViewContainer");
        if (this.gvc != null) {
            this.gvc_rect = this.gvc.getBoundingClientRect()
            this.gvcoffset = this.gvc.getBoundingClientRect().left
        }

        //init ndc
        this.ndc = document.getElementById("InformationContainer");

        //init valid graphtypes
        for (const i in graphStructures) {
            this.validGraphTypes.push(graphStructures[i].graphtype)
        }

        //https://barker.codes/blog/unique-array-values-in-javascript/#check-if-every-value-is-unique
        //checking if all MDP graph types are unique and if not throwing error (but continuing as normal, using first occurance of graph for every)
        if (!(this.validGraphTypes.every((value, _index, array) => { return array.indexOf(value) === array.lastIndexOf(value); }))) {
            p("Not all graph types are unique!")
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
                    i.style.left = (parseInt(i.style.left) + event.movementX) + "px"
                    i.style.top = (parseInt(i.style.top) + event.movementY) + "px"
                }
            }
            this.loadConnectors()
        }
    }

    //general mouse wheel zoom
    handleMouseWheelEvent(event: WheelEvent) {
        if (this.gvc == null) { return }
        this.zoom *= 1.1 * Math.sign(event.deltaY)
        this.gvc.style.scale = this.zoom + ""
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
            for (const i in this.graphitems) { this.graphitems[i].remove() }
            this.graphitems = []
            this.graphitemdata = []
            this.loadGraphElems(this.validGraphTypes.indexOf(type));
            return true
        }
        else { console.log("Graph type doesnt have corresponding graph!"); return false; }
    }

    //for a set graph type, fetch node data, add it to graphitemdata array and pass it on to createNode.
    //also checks for duplicate ids upon loading that graph in.
    loadGraphElems(typeIndex: number) {
        if (this.gvc?.parentElement == null) { return }
        for (const i in graphStructures[typeIndex].nodes) { this.loadGraphElem(graphStructures[typeIndex].nodes[i]) }

        const ids = []
        for (const i of this.graphitemdata) {
            const id = i.id
            if (ids.indexOf(id) != -1) { p("Duplicate id: " + id) }
            ids.push(id)
        }

        this.cnv = document.createElement("canvas")
        let wt = this.gvc?.parentElement?.getBoundingClientRect().width; let ht = this.gvc?.parentElement?.getBoundingClientRect().height
        wt ??= 1; ht ??= 1

        this.cnv.height = ht
        this.cnv.width = wt
        this.cnv.style.position = "fixed"
        this.gvc.parentElement.prepend(this.cnv)
        this.conns = graphStructures[typeIndex].connectors
        this.loadConnectors()
    }

    //Load in a given element by passing its information data to node data array and its graph element data to html element.
    loadGraphElem(elem: graphDataNode, parent?: HTMLElement) {
        const elemX = elem.posX;
        const elemY = elem.posY;
        const elemType = elem.type;
        let elemNodeTitle = elem.title;
        elemNodeTitle ??= "Untitled"
        const elemID = elem.id;
        const children = elem.children;
        let childDeg = elem.childDegree;
        childDeg ??= 0;
        if (parent == null) {
            this.createNode(elemX, elemY, elemType, elemNodeTitle, elemID, childDeg, children, parent);
            this.graphitemdata.push(elem);
        }
        else {
            this.createNode(elemX, elemY, elemType, elemNodeTitle, elemID, childDeg, children, parent);

        }
    }

    //Given a nodes json data, initialise it based on its type.
    createNode(X: number, Y: number, type: string, title: string, id: string, childDegree: number, children?: { posX: number; posY: number; type: string; title?: string; id: string }[], pParent?: HTMLElement) {
        if (this.gvc == null) { return }
        let parent = pParent
        parent ??= this.gvc
        const newNode = document.createElement("button")
        newNode.style.borderRadius = "45%"
        newNode.style.transform = ("scale(" + (1 * (0.75 ** childDegree)))
        newNode.onclick = function () { graphMGR.displayNodeData(newNode) }
        newNode.textContent = validCategories.problemTypes.includes(title) ? title : ("\"" + title + "\"?")
        if (children != null) { children.forEach((i) => this.loadGraphElem(i, newNode)) }
        newNode.style.display = "inline-block"
        newNode.style.width = "auto";
        newNode.setAttribute("class", newNode.getAttribute("class") + " graphitem")
        if (type == "ClickableSubNode") { newNode.setAttribute("class", newNode.getAttribute("class") + " child node") }
        newNode.setAttribute("draggable", "false")
        newNode.style.verticalAlign = "middle"
        newNode.style.position = "absolute"
        newNode.style.left = X + "px"
        newNode.style.top = Y + "px"
        newNode.id = id

        this.graphitems.push(newNode)
        parent.appendChild(newNode)
    }

    //loads in connecting lines between nodes.
    loadConnectors() {
        if ((this.cnv == null) || (this.conns == undefined) || (this.gvc == null)) { return }
        const ctx = this.cnv.getContext("2d");
        if (ctx == null) { p("Context is null"); return }
        ctx.clearRect(0, 0, this.cnv.width, this.cnv.height)

        this.gvcoffset ??= this.gvc.getBoundingClientRect().left

        //adapted from https://jsfiddle.net/m1erickson/86f4C/
        for (const conn of this.conns) {
            const connFrom = conn.idFrom;
            const connTo = conn.idTo;
            const elemFrom = document.getElementById(connFrom)
            const elemTo = document.getElementById(connTo)
            if ((elemFrom == null) || (elemTo == null)) { continue }
            const pos1 = elemFrom.getBoundingClientRect()
            //gvc left or top are inherent offset in gvc. Makes canvas thats otherwise unaffected by this offset work properly.
            const pos1centerX = (pos1.left + 0.5 * (pos1.right - pos1.left)) - this.gvcoffset
            const pos1centerY = (pos1.top + 0.5 * (pos1.bottom - pos1.top)) - this.gvcoffset
            const pos2 = elemTo.getBoundingClientRect()
            const pos2centerX = (pos2.left + 0.5 * (pos2.right - pos2.left)) - this.gvcoffset
            const pos2centerY = (pos2.top + 0.5 * (pos2.bottom - pos2.top)) - this.gvcoffset
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

    //display json results for clicked nodes, if possible
    displayNodeData(node: HTMLElement) {
        if (this.ndc == null) { return }

        //remove all "old" node info elements
        this.undisplayNodeData()

        //close the options menu if it currently is covering the right hand screen
        this.ndc.style.overflowY = "scroll"
        this.ndc.style.overflowX = "hidden"
        optionsCTR.closeOptions()

        let problem
        for (const i of this.graphitemdata) {
            if (node.id == i.id) { problem = i.title }
        }
        problem ??= "Title not found"
        const mdptype = this.graphtype


        const HeadlineText = "Displaying information for " + problem + " in " + mdptype + "(s):"
        this.makeparagraph(HeadlineText, true)
        const nodeResults: complexityResult[] = [];
        const nodeResultTitles: string[] = [];
        this.fetchResults(mdptype, problem, nodeResults, nodeResultTitles)
        if (nodeResults.length == 0) { this.makeparagraph("Sorry, no results found. You can add additional results in complexity_result_jsons\\json_directory following the guide template. Add them into the import list in index.ts, and the program should handle the rest.") }
        for (const i in nodeResults) {
            const ii = parseInt(i)
            this.makeresult(ii + 1, nodeResultTitles[i], nodeResults[i])
        }
    }

    //get the names and data for a given mdp type and problem type combination
    fetchResults(mdptype: string, problemtype: string, nodeResults: complexityResult[], nodeResPapers: string[]) {
        function addIfValid(result: complexityResult) {

            if (
                (result.mdpType == mdptype) &&
                (result.problemType == problemtype)
            ) {
                nodeResults.push(result)
                return true;
            }
        }
        resultNodes.forEach((paperJson) => {
            paperJson.results.forEach((result) => {
                if (addIfValid(result)) { nodeResPapers.push(paperJson.title) }
            })
        })

    }

    ////
    //// Generate output from a clicked graph node to be displayed in the righthand panel
    ////

    //make paragraph element containing text with optional <br> afterwards
    makeparagraph(text: string, makebreak?: boolean) {
        const para = document.createElement("p")
        para.setAttribute("class", "nodeDataDisplayElem")
        para.style = "position:relative;left:10px;word-wrap: break-word;"
        para.textContent = text;
        this.ndc?.append(para)
        this.nodeitems.push(para)
        if (makebreak) { this.makebreak() }

    }

    //make break element
    makebreak() {
        const br = document.createElement("br")
        br.setAttribute("class", "nodeDataDisplayElem")
        this.ndc?.append(br)
        this.nodeitems.push(br)
    }

    //make horizontal divier line
    makehrule() {
        const hr = document.createElement("hr")
        hr.setAttribute("class", "nodeDataDisplayElem")
        this.ndc?.append(hr)
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
        const outDict = {
            posX: node.posX,
            posY: node.posY,
            type: node.type,
            title: node.title,
            id: node.id,
            children: childrenJson,
            childDegree: node.childDegree
        }
        return outDict
    }

    //Get JSON for the current graph as given by graphitemdata and conns (NOT VISIBLE GRAPH DIRECTLY)
    getGraphAsJson() {
        const nodeEntries: graphDataNode[] = []
        for (const i of this.graphitemdata) {
            nodeEntries.push(this.fetchNodeJsonEntry(i))
        }
        const outDict = {
            graphtype: this.graphtype,
            nodes: nodeEntries,
            connectors: this.conns
        }
        return outDict
    }

    //download json file with filename given by param. adjusted from stackoverflow answer.
    download(fileName: string) {
        const content = JSON.stringify(this.getGraphAsJson(), null, "\t");
        const a = document.createElement("a");
        const file = new Blob([content]);
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
}

