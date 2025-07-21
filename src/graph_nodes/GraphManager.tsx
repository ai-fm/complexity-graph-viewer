import rawGraphStructures from "../complexity_graph_configs/graphindex";

import validCategories from "../../mdp_configs/node-category-values.json";
import { graphMGR, p } from "../main";
import { nodes as resultNodes } from "../nodes/nodes";
import "./graph_nodes.css";
p("print import for quicker debug")
const graphStructures: {
    graphtype: string;
    nodes: {
        posX: number;
        posY: number;
        type: string;
        title?: string;
        children?: {
            posX: number;
            posY: number;
            type: string;
            title?: string;
        }[]
    }[];
}[] = rawGraphStructures;

//GraphManager is responsible for handling construction, movement and unloading/loading of the graph elements.
export class GraphManager {
    //offsets represent mouse movement away from "default" position
    xoffset = 0;
    yoffset = 0;
    //used in movement dragging calculation
    lastX = 0;
    lastY = 0;
    //zoom factor for all graph  elements
    zoom = 1;
    //graph view container and its' bounding client rect. 
    gvc: HTMLElement | null = null;
    gvc_rect: DOMRect | null = null;
    //node data container for results
    ndc: HTMLElement | null = null;
    //currently active graph elements
    graphitems: HTMLElement[] = [];
    //positional data and other information about nodes. Read from json and applied to corresponding graphitems
    graphitemdata: (number | string)[][] = [];
    //currently active node data elements
    nodeitems: HTMLElement[] = []
    //Graph types that can be rendered, read from complexity_graph_configs. 
    //Graph may be represented in results, thus dropdown, but not have corresponding graph here, leading to no graph changes.
    //Graph may be represented in validGraphTypes but not results, thus being inaccessible.
    validGraphTypes: string[] = [];
    //current graph type. Initialized as first valid type, can alternatively be coded to "MDP" or probably to on initialisation fetch initial Dropdown element
    graphtype = "MDP";//this.validGraphTypes[0];
    //If valid, reset graph viewer and unset graph items and data. Then, generate new graph for currently selected type
    //!!! I can't with certainty say this removes the elements instead of simply unbinding them without automatically causing this. 
    //i doubt that will pose a problem in either case, but i am clearly disclosing this here to make finding it a bit easier if it were to.
    //presume it works as intended -> https://stackoverflow.com/questions/11817716/how-can-i-remove-an-element-that-is-not-in-the-dom
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
            return true
        }
        else { console.log("Graph type doesnt have corresponding graph!"); return false; }
    }


    //for a set graph type, fetch node data, add it to graphitemdata array and pass it on to createNode
    loadGraphElems(typeIndex: number) {
        for (const i in graphStructures[typeIndex].nodes) {
            this.loadGraphElem(graphStructures[typeIndex].nodes[i])

        }
    }

    loadGraphElem(elem: {
        posX: number; posY: number; type: string; title?: string; children?: {
            posX: number;
            posY: number;
            type: string;
            title?: string;
        }[]; childDegree?: number;
    }, parent?: HTMLElement) {
        const elemX = elem.posX;
        const elemY = elem.posY;
        const elemType = elem.type;
        let elemNodeTitle = elem.title;
        elemNodeTitle ??= "Untitled"
        const children = elem.children;
        let childDeg = elem.childDegree;
        childDeg ??= 0;
        this.graphitemdata.push([elemX, elemY, elemType, elemNodeTitle]);
        this.createNode(elemX, elemY, elemType, elemNodeTitle, childDeg, children, parent);
    }

    //initialise correct parameters 
    initGraphMGR() {
        //init gvc
        this.gvc = document.getElementById("graphViewContainer");
        if (this.gvc != null) { this.gvc_rect = this.gvc.getBoundingClientRect() }

        //init ndc
        this.ndc = document.getElementById("filterAndDataContainer");

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

    makeparagraph(text: string, makebreak?: boolean) {
        const para = document.createElement("p")
        para.setAttribute("class", "nodeDataDisplayElem")
        para.style = "position:relative;left:10px;word-wrap: break-word;"
        para.textContent = text;
        this.ndc?.append(para)
        this.nodeitems.push(para)
        if (makebreak) { this.makebreak() }

    }

    makebreak() {
        const br = document.createElement("br")
        br.setAttribute("class", "nodeDataDisplayElem")
        this.ndc?.append(br)
        this.nodeitems.push(br)
    }

    makehrule() {
        const hr = document.createElement("hr")
        hr.setAttribute("class", "nodeDataDisplayElem")
        this.ndc?.append(hr)
        this.nodeitems.push(hr)
    }

    makeresult(resNumber: number, restitle: string, resData: { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; complexitysuffix: string; horizonType: string; generalProofType: string; proofNotes: string; determinism?: undefined; dependence?: undefined; complexityNotes?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; horizonType: string; determinism: string; dependence: string; generalProofType: string; proofNotes: string; complexitysuffix?: undefined; complexityNotes?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; horizonType: string; determinism: string; generalProofType: string; proofNotes: string; complexitysuffix?: undefined; dependence?: undefined; complexityNotes?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; complexitysuffix: string; complexityNotes: string; horizonType: string; dependence: string; generalProofType: string; proofNotes: string; determinism?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; complexitysuffix: string; complexityNotes: string; horizonType: string; determinism: string; generalProofType: string; proofNotes: string; dependence?: undefined; }) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchResults(mdptype: string, problemtype: string, nodeResults: any[], nodeResPapers: string[]) {
        function addIfValid(result: { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; complexitysuffix: string; horizonType: string; generalProofType: string; proofNotes: string; determinism?: undefined; dependence?: undefined; complexityNotes?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; horizonType: string; determinism: string; dependence: string; generalProofType: string; proofNotes: string; complexitysuffix?: undefined; complexityNotes?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; horizonType: string; determinism: string; generalProofType: string; proofNotes: string; complexitysuffix?: undefined; dependence?: undefined; complexityNotes?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; complexitysuffix: string; complexityNotes: string; horizonType: string; dependence: string; generalProofType: string; proofNotes: string; determinism?: undefined; } | { mdpType: string; problemType: string; problemApproach: string; problemNotes: string; complexity: string; complexitysuffix: string; complexityNotes: string; horizonType: string; determinism: string; generalProofType: string; proofNotes: string; dependence?: undefined; }) {

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

    //display json results for clicked nodes, if possible
    displayNodeData(node: HTMLElement) {
        if (this.ndc == null) { return }
        //remove all "old" node info elements
        for (const i of this.nodeitems) {
            i.remove()
        }

        //rename for clarity
        let problem = node.textContent
        problem ??= "Untitled"
        const mdptype = this.graphtype



        const HeadlineText = "Displaying information for " + problem + " in " + mdptype + "(s):"
        this.makeparagraph(HeadlineText, true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nodeResults: any[] = [];
        const nodeResultTitles: string[] = [];
        this.fetchResults(mdptype, problem, nodeResults, nodeResultTitles)
        if (nodeResults.length == 0) { this.makeparagraph("Sorry, no results found. You can add additional results in complexity_result_jsons\\json_directory following the guide template. Add them into the import list in index.ts, and the program should handle the rest.") }
        for (const i in nodeResults) {
            const ii = parseInt(i)
            this.makeresult(ii + 1, nodeResultTitles[i], nodeResults[i])

        }

    }

    //Given a nodes json data, initialise it based on its type.
    createNode(X: number, Y: number, type: string, title: string, childDegree: number, children?: { posX: number; posY: number; type: string; title?: string; }[], pParent?: HTMLElement) {
        if (this.gvc == null) { return }
        let parent = pParent
        parent ??= this.gvc
        let newNode: HTMLElement
        if (type == "ClickableGraphNode") {
            newNode = document.createElement("button")
            newNode.style.borderRadius = "45%"
            newNode.style.display = "inline-block"
            //checking if node title = problem type specified in node category values
            if (validCategories.problemTypes.includes(title)) {
                newNode.textContent = title
            }
            else {
                newNode.textContent = ("\"" + title + "\"?")
            }
            newNode.onclick = function () { graphMGR.displayNodeData(newNode) }


        }
        else if (type == "ClickableSubNode") {
            newNode = document.createElement("button")
            newNode.style.borderRadius = "45%"
            newNode.setAttribute("class", newNode.getAttribute("class") + " child node")


            newNode.style.width = "0px"
            //checking if node title = problem type specified in node category values
            if (validCategories.problemTypes.includes(title)) {
                newNode.textContent = title
            }
            else {
                newNode.textContent = ("\"" + title + "\"?")
            }
            newNode.onclick = function () { graphMGR.displayNodeData(newNode) }


        }
        else { //use test as default case for invalid assignments
            newNode = document.createElement("img")
            newNode.setAttribute("src", "temp_options_button.png")
        }
        newNode.style.transform = ("scale(" + (1 * (0.75 ** childDegree)))

        if (children != null) {
            for (const i of children) {
                this.loadGraphElem(i, newNode)
            }
        }
        newNode.style.width = "auto";
        newNode.setAttribute("class", newNode.getAttribute("class") + " graphitem")
        newNode.setAttribute("draggable", "false")
        //newNode.style.position = (childDegree <= 0) ? "absolute" : "relative"//
        newNode.style.verticalAlign = "middle"
        if (childDegree <= 0) {
            newNode.style.position = "relative"//

        }
        else {
            newNode.style.position = "absolute"

        }
        //newNode.style.position = "absolute"
        newNode.style.left = X + "px"
        newNode.style.top = Y + "px"
        parent.appendChild(newNode)

        this.graphitems.push(newNode)

    }



    handleMouseDownEvent(event: MouseEvent) {
        this.lastX = event.clientX;
        this.lastY = event.clientY;
    }




    handleMouseMoveEvent(event: MouseEvent) {

        for (const i of this.graphitems) {
            if (!i.getAttribute("class")?.includes("child node")) {
                i.style.left = (parseInt(i.style.left) + event.movementX) + "px"
                i.style.top = (parseInt(i.style.top) + event.movementY) + "px"
            }
        }

    }

    handleMouseWheelEvent(event: WheelEvent) {
        if (this.gvc == null) { return }

        if (event.deltaY < 0) {
            this.zoom *= 1.1
        }
        else if (event.deltaY > 0) {
            this.zoom /= 1.1
        }

        for (const i of this.graphitems) {
            const itemzoom = (i.style.zoom.includes("%")) ? parseInt(i.style.zoom, 10) / 100 : parseInt(i.style.zoom, 10);
            i.style.zoom = itemzoom * this.zoom + "";


        }

    }
}

