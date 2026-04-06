
import "./graph_nodes.css";
import { validCategories, mousedown, optionsOpen, p, graphNode, complexityResult, currentGraphType, validGraphTypes, getGraphByType, paperResults, Paper, graphZoom, setGraphZoom, calcGraphOffsets, graphOffsets, activeEditNode, graphEditActive, setEditNode, getNodeFromID, activeEditGraph } from "./global";
import { MDPApp } from "./MDPApp";
import { optionsController } from "./optionsController";


//GraphManager is responsible for handling construction, movement and unloading/loading of the graph elements.
export class GraphManager {
    optionsCTR: optionsController | null = null
    styleBarRects:HTMLElement[]=[]
    setOptionsController(optionsCTR: optionsController) {
        this.optionsCTR = optionsCTR
    }
    
    //check if graphMGR is in edit mode
    editMode = false;
    //graph view container and its' bounding client rect. 
    gvc: HTMLElement
    gvc_rect: DOMRect
    //node data container for results
    ndc: HTMLElement
    //canvas for lines between nodes.
    cnv: HTMLCanvasElement | null = null;
    //currently active graph elements
    graphitems: HTMLElement[] = [];
    graphitemdata: graphNode[] = []
    //stores button span elements that store their title, to avoid some of the issues that come with making it tied to textcontent (i.e. empty textcontent deleting child nodes, no space, etc)
    graphitemtext: HTMLElement[] = [];
    //include special cases with potentially hyperspecific cases, in the specials string array
    includeSpecialCases = true;

    constructor(mdpApp: MDPApp) {
        this.gvc = mdpApp.gvc
        this.gvc_rect = this.gvc.getBoundingClientRect()
        // If a node is currently being edited, clicking the background will set that to not be the case any more. 
        this.gvc.onclick = () => {
            if(activeEditNode!=null){
                setEditNode(null);
                this.loadGraph("edit")
            }
        }
        this.ndc = mdpApp.infoContainer
    }

    ////
    //// Main graph management
    ////

    /// Generate graph elements

    // update graph type from one to another. 
    loadGraph(type: string) {
        if (validGraphTypes.includes(type) || (type=="edit")) {
            p(type,getGraphByType(type))
            const ctx = this.cnv?.getContext("2d");
            if ((ctx != null) && (this.cnv != null)) { ctx.clearRect(0, 0, this.cnv.width, this.cnv.height) } else { p("unexpected canvas error") }
            this.unloadGraphItems()
            this.loadGraphElems(type);
            this.loadConnectors(type)
            return true
        }
        else {
            console.log("Graph type doesnt have corresponding graph!", type);
            if (validGraphTypes.length > 0) { this.loadGraph("NoGraph") }
            return false;
        }
    }

    //for a set graph type, fetch node data, add it to graphitemdata array and pass it on to createNode.
    loadGraphElems(type:string) {
        for (const i of getGraphByType(type).nodes) { 
            this.createNode(i);
            this.graphitemdata.push(i);     
        }

        const ids = []
        for (const i of this.graphitemdata) {
            const id = i.id
            if (ids.indexOf(id) != -1) { /*p("Duplicate id: " + id)*/ }
            ids.push(id)
        }

        this.cnv = document.createElement("canvas")
        let wt = this.gvc.parentElement?.getBoundingClientRect().width; let ht = this.gvc.parentElement?.getBoundingClientRect().height
        wt ??= 1; ht ??= 1

        this.cnv.height = ht
        this.cnv.width = wt
        this.cnv.style.position = "fixed"
        this.gvc.parentElement?.prepend(this.cnv)

        const elements = document.getElementsByClassName("colorRect");
        while(elements.length > 0){
            if(elements[0].parentNode!=null){elements[0].parentNode.removeChild(elements[0]);}
        }
        
        for (const i of this.graphitems) { this.filterStyliseNodes(i) }
        this.loadConnectors(type)
    }

    //Given a nodes json data, initialise it based on its type.
    // This also includes behaviour related to how it behaves when edited! 
    createNode(el: graphNode, pParent?: HTMLElement) {
        let parent = pParent
        parent ??= this.gvc
        const newNode = document.createElement("div")

        el.childDegree ??= 0
        newNode.style.transform = "scale(" + this.getNodeScale(el.title as string) + ")"
        //span to hold buttons text instead of button. avoids some issues.
        const txtspan = document.createElement("span")

        el.title ??= "Untitled"
        //if titled new, leave empty for user to name. Else, if invalid, add ""? to name to indicate so.
        txtspan.textContent = this.getValueTypeFromTitle(el.title) == "Error" ? ("\"" + el.title + "\"?") : el.title
        txtspan.style.whiteSpace = "pre-line"

        //this is a hack job to make longer complexities always take two lines and allow easy fetching of line count for longer titles for proper displaying thereof
        //it works but will look jank for shorter words with spaces between them. this is primarily for showing this off, and while it doesnt need fixing if given the time i will improve upon this
        txtspan.textContent = txtspan.textContent.replace(" ", "\n")


        if (el.children != null) { 
            el.children.forEach(
                (i) => {
                    this.createNode(i, newNode);
                    this.graphitemdata.push(i);
                }) 
        }

        newNode.style.display = "flex"
        newNode.style.flexDirection = "column-reverse"
        newNode.style.width = "auto";
        newNode.setAttribute("class", newNode.getAttribute("class") + " graphitem")
        if (el.type == "ClickableSubNode") { newNode.setAttribute("class", newNode.getAttribute("class") + " child node") }
        newNode.setAttribute("draggable", "false")
        newNode.style.verticalAlign = "middle"
        newNode.style.position = "absolute"

        
        el.posX ??= 0; el.posY ??= 0;
        const [offX,offY] = graphOffsets
        if(el.childDegree==0){
            newNode.style.left = (el.posX+offX)/graphZoom + "px" 
            newNode.style.top = (el.posY+offY)/graphZoom + "px"
        }
        else{
            newNode.style.left = (el.posX)/graphZoom + "px" 
            newNode.style.top = (el.posY)/graphZoom + "px"
        }
        newNode.id = el.id
        txtspan.id = el.id + "SP"

        // If there currently is no actively edited graph node, handle everything as normal.
        if(activeEditNode==null){
            //display data on click. passed through handler.
            newNode.onclick = (event) => {
                //empty span failsafe [Buttons can get emptied out text and onchange and emptied functions dont seem to fire, so instead, putting it here]
                const sp = document.getElementById(newNode.id + "SP") //var for null check
                if (sp != null && sp.textContent == "") { sp.textContent = "<>"; }
                this.nodeOnClick(newNode, event);
            }
        }
        // otherwise, let clicking remove it as active edit node and reload the graph to reset click events.
        else{
            newNode.onclick = (event) => {
                event.stopPropagation()
                setEditNode(null)
                this.loadGraph("edit")
            }
            
        }
        // If the graph in editing mode, double clicking a node should set it as the currently actively edited object.
        // Further, its span's content should be editable in this mode, and update the corresponding actively edited graph
        if(graphEditActive){
            newNode.ondblclick = (event) => { 
                event.stopPropagation()
                newNode.style.opacity="0.5"
                setEditNode(getNodeFromID(newNode.id,activeEditGraph.nodes))
            }
            txtspan.contentEditable="true"
            txtspan.oninput=()=>{
                getNodeFromID(newNode.id,activeEditGraph.nodes).title=txtspan.textContent
            }
        }

        // color currently edited node differently if one is in use. Also overwrite on click behaviour.
        if((activeEditNode!=null)&&(newNode.id==activeEditNode.id)){
            newNode.style.opacity = "0.5"
        }

        const nodeDataContainer = document.createElement("div")
        nodeDataContainer.style.display = "flex"
        nodeDataContainer.style.flexDirection = "row"
        nodeDataContainer.style.justifyContent = "center"

        this.graphitemtext.push(txtspan)
        nodeDataContainer.appendChild(txtspan)
        const vline = document.createElement("div")
        vline.style.borderRight = "1px solid #000000"
        vline.style.width = "3px" //add some space to look better
        //x^1nodeDataContainer.appendChild(vline)

        const minmaxContainer = document.createElement("div")
        minmaxContainer.style.display = "flex"
        minmaxContainer.style.flexDirection = "column"
        minmaxContainer.style.justifyContent = "space-evenly"

        //fixed and scaled by amount of lines in span

        // eslint-disable-next-line no-control-regex
        const linecount = 1 + (txtspan.textContent.match(new RegExp("\n", "g")) || []).length
        const circleWidth = 10 * linecount
        const circleHeight = 10 * linecount
        const circleSize = Math.PI * linecount

        const minCir = document.createElement("div")
        minCir.style.backgroundColor = "#000000"
        //used as spacing since clippath masks the rest of the square
        minCir.style.width = circleWidth + "px"
        minCir.style.height = circleHeight + "px"
        minCir.style.clipPath = "circle(" + circleSize + "px)"
        minCir.id = el.id + "MIN"
        const maxCir = document.createElement("div")
        maxCir.style.backgroundColor = "#000000"
        //used as spacing since clippath masks the rest of the square
        maxCir.style.width = circleWidth + "px"
        maxCir.style.height = circleHeight + "px"
        maxCir.style.clipPath = "circle(" + circleSize + "px)"
        maxCir.id = el.id + "MAX"
        minmaxContainer.append(minCir)
        minmaxContainer.append(maxCir)

        nodeDataContainer.append(minmaxContainer)

        const special = document.createElement("span")
        special.textContent = ""
        special.style.color = "red"
        special.style.fontSize = 16 * linecount + "px"
        special.id = el.id + "SPC"
        nodeDataContainer.append(special)

        newNode.append(nodeDataContainer)

        const nodeVisualBG = document.createElement("button")
        nodeVisualBG.id = el.id + "BG"
        nodeVisualBG.style.position = "absolute"
        nodeVisualBG.style.left = newNode.offsetLeft - 5 + "px"
        nodeVisualBG.style.top = newNode.offsetTop + "px"
        nodeVisualBG.style.bottom = newNode.offsetHeight - 2.5 + "px"
        nodeVisualBG.style.right = newNode.offsetWidth - 5 + "px"
        nodeVisualBG.style.zIndex = "-1"
        newNode.appendChild(nodeVisualBG)

        this.graphitems.push(newNode)
        parent.appendChild(newNode)
    }

    //loads in connecting lines between nodes.
    loadConnectors(type:string ) {
        const conns=getGraphByType(type).connectors
        if ((this.cnv == null) || (conns == undefined)) { return }
        const ctx = this.cnv.getContext("2d");
        if (ctx == null) { p("Context is null"); return }
        ctx.clearRect(0, 0, this.cnv.width, this.cnv.height)

        //adapted from https://jsfiddle.net/m1erickson/86f4C/
        for (const conn of conns) {
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
            //unused for the time being
            if (connType == "arrow") {

                const vecX = (pos2centerX - pos1centerX) / ((pos2centerX - pos1centerX) + (pos2centerY - pos1centerY))
                const vecY = (pos2centerY - pos1centerY) / ((pos2centerX - pos1centerX) + (pos2centerY - pos1centerY))

                const angle = (Math.PI / 180) * 120
                const vecXL = Math.cos(angle) * vecX - Math.sin(angle) * vecY
                const vecYL = Math.cos(angle) * vecY + Math.sin(angle) * vecX
                const vecXR = Math.cos(-angle) * vecX - Math.sin(-angle) * vecY
                const vecYR = Math.cos(-angle) * vecY + Math.sin(-angle) * vecX

                const endPosLineX = pos2centerX - (vecX * 30 * graphZoom)
                const endPosLineY = pos2centerY - (vecY * 30 * graphZoom)
                const endPosX = pos2centerX - (vecX * 10 * graphZoom)
                const endPosY = pos2centerY - (vecY * 10 * graphZoom)
                const linePath = new Path2D("M " + pos1centerX + " " + pos1centerY + //start position
                    " L " + (endPosLineX) + " " + endPosLineY //end position, scaled
                )

                ctx.stroke(linePath);
                ctx.fill(new Path2D(
                    " M " + (endPosLineX) + " " + endPosLineY + //last end pos
                    " L " + (endPosLineX + (vecXL * 10 * graphZoom)) + " " + (endPosLineY + (vecYL * 10 * graphZoom)) +// left arrow point 
                    " L " + endPosX + " " + endPosY + //fin end pos
                    " L " + (endPosLineX + (vecXR * 10 * graphZoom)) + " " + (endPosLineY + (vecYR * 10 * graphZoom)) // right arrow point 

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

    // apply colors to nodes depending on the underlying complexity results
    filterStyliseNodes(node: HTMLElement) {
        //
        document.querySelectorAll(".colorRect").forEach(el => 
            {
                const e=el as HTMLElement
                if(e.style.height=="0px")
                {e.remove()}

            });   
        
        const nodeResults: complexityResult[] = [];
        const nodeResultTitles: string[] = [];
        this.fetchResults(node, currentGraphType, nodeResults, nodeResultTitles)
        //list so it preserves order for lowest, highest
        //this checks containment in node-category-values and takes first entry from there which matches these. i.e EXPTIME in ["EXP","EXPTIME"]->arr[0]="EXP"-> ff5500 
        let total = 0
        const count_list: [string, number, string][] = [
            ["NL", 0, "#00ffff"],
            ["PL", 0, "#00ffaa"],
            ["NC", 0, "#00ff55"],
            ["P", 0, "#00ff00"],

            ["NP", 0, "#ffdd00"],
            //conp isnt in my results yet whoops

            ["PP", 0, "#ff9900"],

            ["ETR", 0, "#ff5500"],
            ["PSPACE", 0, "#ff0000"],

            ["EXP", 0, "#ff0099"],

            ["NEXP", 0, "#ff00ff"],

            ["EXPSPACE", 0, "#d000ff"],

            ["Undecidable", 0, "#0000ff"],

            ["Possibly Open", 0, "#999999"],
            ["Open Question", 0, "#ffffff"], //THIN BORDERS DONT FORGET!

            ["Decidable not otherwise specified", 0, "#000000"],
            ["NPPP", 0, "#000000"] //i dont know where between NP and PP and PSPACE  NP^PP is so its here for now. esp because i dont have any results with it why did i add it before coNP etc
        ]
        let comp = ""
        for (const i of nodeResults) {
            for (const j of validCategories.complexityClass) {
                if (j.includes(i.complexity)) { comp = j[0] }
            }
            for (const k of count_list) {
                if (k[0] == comp) { k[1] += 1; total += 1 }
            }
        }


        const nodebg = document.getElementById(node.id + "BG")
        if (nodebg == undefined) { return }

        const rect = document.createElement("div")
        rect.className="colorRect"
        const min_rect = -2
        let max_rect = node.offsetWidth + 10

        rect.style.position = "absolute"
        rect.style.left = min_rect + "px"
        rect.style.top = -5 + "px"
        rect.style.height = node.offsetHeight / 3 + "px"
        rect.style.width = max_rect + "px"


        let offset = 0
        if (total == 0) {


            const spc = document.getElementById(node.id + "SPC")
            if (spc != null) {
                spc.textContent = "∅"
                spc.style.color = "#000000"
                max_rect = max_rect + spc.offsetWidth
            }

            // commented out for synthetic data approach: rect.style.backgroundColor = "#000000" 
            //
            // The following is just synthetic nonsense data.

            /*if (true) {
                for (const i of count_list) {
                    i[1] = Math.floor(Math.random() * 50); total += i[1]

                }
                const step = (1 + max_rect) / total
                for (const i of count_list) {
                    if (i[1] > 0) {
                        const rect_current = document.createElement("div")
                        rect_current.style.position = "absolute"
                        rect_current.style.left = offset - 1 + "px"
                        rect_current.style.top = -1 + "px"
                        rect_current.style.height = (node.offsetHeight / 3) - 1 + "px"
                        rect_current.style.width = step * i[1] - 1 + "px"
                        rect_current.style.backgroundColor = i[2]
                        const max = document.getElementById(node.id + "MAX")
                        if (max != null) { max.style.backgroundColor = i[2] }

                        rect_current.style.borderTop = "1px solid #808080"
                        rect_current.style.borderBottom = "1px solid #808080"
                        rect_current.style.borderLeft = "1px solid #80808080"
                        if (offset == 0) {
                            const min = document.getElementById(node.id + "MIN")
                            if (min != null) {
                                min.style.backgroundColor = i[2]

                                rect_current.style.left = offset + "px"
                                rect_current.style.borderLeft = "1px solid #757575"
                            }
                        }

                        rect.appendChild(rect_current)

                        offset += i[1] * step
                        if (offset >= max_rect) {
                            rect_current.style.width = step * i[1] - 2 + "px"
                            rect_current.style.borderRight = "1px solid #757575"
                        }
                        //p(total, step, max_rect, min_rect + total * step)
                    }
                }
            }*/

        }
        else {
            const step = (1 + max_rect) / total
            const spc = document.getElementById(node.id + "SPC")
            if (spc != null) { spc.textContent = "" }
            for (const i of count_list) {
                if (i[1] > 0) {
                    if (spc != null) {
                        if (i[0] == "Possibly Open") { spc.textContent += "?" }
                        else if (i[0] == "Open") { spc.textContent += "!" }

                        max_rect = max_rect + spc.offsetWidth
                    }

                    const rect_current = document.createElement("div")
                    rect_current.style.position = "absolute"
                    rect_current.style.left = offset - 1 + "px"
                    rect_current.style.top = -1 + "px"
                    rect_current.style.height = (node.offsetHeight / 3) - 1 + "px"
                    rect_current.style.width = step * i[1] - 1 + "px"
                    rect_current.style.backgroundColor = i[2]
                    const max = document.getElementById(node.id + "MAX")
                    if (max != null) { max.style.backgroundColor = i[2] }

                    rect_current.style.borderTop = "1px solid #808080"
                    rect_current.style.borderBottom = "1px solid #808080"
                    rect_current.style.borderLeft = "1px solid #80808080"
                    if (offset == 0) {
                        const min = document.getElementById(node.id + "MIN")
                        if (min != null) {
                            min.style.backgroundColor = i[2]

                            rect_current.style.left = offset + "px"
                            rect_current.style.borderLeft = "1px solid #757575"
                        }
                    }

                    rect.appendChild(rect_current)

                    offset += i[1] * step
                    if (offset >= max_rect) {
                        rect_current.style.width = step * i[1] - 2 + "px"
                        rect_current.style.borderRight = "1px solid #757575"
                    }



                }
            }

        }
        const rectheightdummy = document.createElement("div")
        rectheightdummy.style.height = node.offsetHeight / 3 + "px"
        node.append(rectheightdummy)

        document.getElementById(node.id + "BG")?.append(rect)

    }

    /// Active graph management

    // find element with a given ID. 
    findItemById(id: string): graphNode | undefined {
        for (const i of this.graphitemdata) {
            if (i.id == id) { return i }
        }
    }

    // find span element associated with ID
    findTextElemById(id: string): HTMLElement | undefined {
        for (const i of this.graphitemtext) {
            if (i.id == (id + "SP")) { return i }
        }
    }

    // get the value type associated with a certain node type, using the valid categories to filter
    getValueTypeFromTitle(title: string | undefined | null) {
        if (title == null || title == undefined) { return "Error" }
        let x: keyof typeof validCategories;
        for (x in validCategories) { for (const i of validCategories[x]) { if (i.includes(title)) { return x; } } }
        if (title == "<>") { return "" }
        return "Error"

    }

    // fetch results that fall under a given node
    fetchResults(node: HTMLElement, mdptype: string, nodeResults: complexityResult[], nodeResPapers: string[]) {
        const [filters, filtervalues] = this.recursiveFilter(node)
        paperResults.forEach((paperJson: Paper) => {
            paperJson.results.forEach((result: complexityResult) => {
                let anyMDPCategory: string | string[] = []
                for (const i of validCategories.mdpType) {if (i.includes("Any")) {anyMDPCategory = i;}}
                if ((result.mdpType == mdptype) || (anyMDPCategory.includes(mdptype))) {
                    let validEntry = true
                    if (filters.includes("Error")) { validEntry = false }
                    for (const i in filters) {
                        const k = filters[i] as keyof typeof result
                        if (filters.includes("special") && ("special" in result)) {
                            if (!(result.special as string[]).includes(filtervalues[i])) { validEntry = false; }
                            if (!this.includeSpecialCases) { validEntry = false; }
                        }
                        else if (!filtervalues.includes(result[k] as string)) {
                            if (filtervalues.includes("Any") && k == "mdpType") { continue }
                            validEntry = false
                        }
                    }
                    if (validEntry) { nodeResPapers.push(paperJson.title); nodeResults.push(result) }
                }
            })
        })
    }

    // filters for fetching results, recursively gained from nodes parents
    recursiveFilter(node: HTMLElement): string[][] {
        const par = node.parentElement;
        let filters = [this.getValueTypeFromTitle(this.findItemById(node.id)?.title)]
        const candidate = this.findTextElemById(node.id)
        let values: string[]
        if ((candidate == null) || (candidate.textContent == null)) { values = ["error"] }
        else { values = [candidate.textContent.replace("\n", " ")] }
        if (validCategories[filters[0]] == undefined) { /*p("No valid filters found. Maybe add them to configs?");*/ return [["Error"], ["Error"]] }

        for (const i of validCategories[filters[0]]) {if (i.includes(values[0])) { values = i } }
        if (par != null && par != this.gvc) {
            const pfilt = this.recursiveFilter(par)
            filters = filters.concat(pfilt[0])
            values = values.concat(pfilt[1])
        }
        return [filters, values]
    }

    /// Remove graph elements

    // delete everything within gvc
    unloadGraphItems() {
        this.cnv?.remove()
        this.gvc.innerHTML=""
    }

    ////
    //// Side-panel management
    ////

    

    // Generate side-panel elements

    //display json results for clicked nodes, if possible
    displayNodeData(node: HTMLElement) {

        //remove all "old" node info elements
        this.undisplayNodeData()

        //close the options menu if it currently is covering the right hand screen
        //if in edit mode this wont be able to be called, obviously
        this.ndc.style.overflowY = "scroll"
        this.ndc.style.overflowX = "hidden"
        this.ndc.style.textAlign = "left"
        if (this.optionsCTR != null) { this.optionsCTR.closeOptions() }

        const nodeResults: complexityResult[] = [];
        const nodeResultTitles: string[] = [];
        this.fetchResults(node, currentGraphType, nodeResults, nodeResultTitles)
        if (nodeResults.length == 0) { this.makeparagraph(this.ndc, "Sorry, no results found. You can add additional results in complexity_result_jsons\\json_directory following the guide template. Add them into the import list in index.ts, and the program should handle the rest.") }
        for (const i in nodeResults) {
            const ii = parseInt(i)
            this.makeresult(ii + 1, nodeResultTitles[i], nodeResults[i])
        }
    }

    // make title paragraph element 
    makeTitleparagraph(resNumber: number, restitle: string, resData: complexityResult) {
        const para = document.createElement("p")
        para.setAttribute("class", "nodeDataDisplayElem")
        para.style.position = "relative"
        para.style.left = "10px"
        para.style.wordWrap = "break-word"
        para.textContent = "Result " + resNumber + " from \"" + restitle + "\":";
        para.style.color = "blue"
        para.onclick = () => { this.openResultBig(resNumber, restitle, resData) }
        this.ndc.append(para)
        return para
    }

    //make paragraph element containing text with optional <br> afterwards
    makeparagraph(target: HTMLElement, text: string, makebreak?: boolean) {
        const para = document.createElement("p")
        para.setAttribute("class", "nodeDataDisplayElem")
        para.style.position = "relative"
        para.style.left = "10px"
        para.style.wordWrap = "break-word"
        para.textContent = text;
        target.append(para)
        if (makebreak) { target.append(document.createElement("br")) }
        return para
    }

    //Generate result entry from prior functions given a result.
    makeresult(resNumber: number, restitle: string, resData: complexityResult) {
        const target = this.ndc
        this.makeTitleparagraph(resNumber, restitle, resData)
        this.makeparagraph(target, "Problem: " + resData.problemType + ", " + resData.problemApproach)
        if (resData.determinism != undefined) { this.makeparagraph(target, "Deterministic? : " + resData.determinism) }
        if (resData.dependence != undefined) { this.makeparagraph(target, "Stationary?: " + resData.dependence) }
        this.makeparagraph(target, "Horizon: " + resData.horizonType)
        const complexity = (resData.complexitysuffix == undefined) ? resData.complexity : resData.complexity + "-" + resData.complexitysuffix
        this.makeparagraph(target, "Complexity: " + complexity)
        this.makeparagraph(target, "General approach: " + resData.generalProofType)
        if (resData.special != undefined) {
            let extraInfo = ""
            for (const i of resData.special) { extraInfo += i }
            this.makeparagraph(target, "Special: " + extraInfo)
        }
        target.append(document.createElement("hr"))
    }

    /// remove all result entries currently displayed in the righthand window.
    undisplayNodeData() {this.ndc.innerHTML=''}


    ////
    //// Big display management
    ////

    // Display one complexity result in a big window
    openResultBig(resNumber: number, restitle: string, resData: complexityResult) {
        if (document.getElementById("bigResultPopup") != null) { document.getElementById("bigResultPopup")?.remove() }
        const view = document.createElement("div")
        view.id = "bigResultPopup"
        view.style.padding = "15px"
        view.style.display = "flex"
        view.style.flexDirection = "column"

        const header = document.createElement("div")
        header.style.display = "flex"
        header.style.flexDirection = "row"
        header.style.justifyContent = "space-between"
        view.append(header)

        const title = this.makeparagraph(header, "Result " + resNumber + " from \"" + restitle + "\":")
        title.style.fontSize = "25px"

        const exit = document.createElement("button")
        exit.textContent = "x"
        exit.style.color = "red"
        exit.style.fontSize = "30px"
        header.append(exit)

        let x: keyof typeof resData;
        for (x in resData) {this.makeparagraph(view, x + " : " + resData[x]).style.fontSize = "20px"}

        for (const i of paperResults) {
            if (i.title == restitle) {
                const link = document.createElement("a")
                link.href = i.url
                link.textContent = "View \"" + i.title + "\""
                view.append(link)
                break;
            }
        }

        this.unloadGraphItems()
        this.cnv?.remove()
        exit.onclick = () => {
            this.loadGraph(currentGraphType)
            view.remove()
        }
        this.gvc.prepend(view)

    }



    ////
    //// Event handlers
    ////

    // general mouse movement. 
    handleMouseMoveEvent(event: MouseEvent) {
        if (mousedown) {
            calcGraphOffsets(event.movementX,event.movementY)
            if(graphEditActive){this.loadGraph("edit")}
            else{this.loadGraph(currentGraphType)}
        }
    }

    //general mouse wheel zoom
    handleMouseWheelEvent(event: WheelEvent) {
        setGraphZoom(graphZoom * (1.1 ** Math.sign(-event.deltaY)))
        this.gvc.style.scale = graphZoom + ""

        if (this.cnv != null) {
            let wt = this.gvc.parentElement?.getBoundingClientRect().width; let ht = this.gvc.parentElement?.getBoundingClientRect().height
            wt ??= 1; ht ??= 1
            this.cnv.height = ht
            this.cnv.width = wt
            this.cnv.style.position = "fixed"
        }

        this.gvc.style.transformOrigin = ("")
        this.loadGraph(currentGraphType)
    }

    //manage node click events
    nodeOnClick(node: HTMLElement, event: MouseEvent) {
        event.stopPropagation()
        if (!optionsOpen) { this.displayNodeData(node) }
    }



    ////
    //// Misc. functions to hopefully rework in the far future 
    ////


    //get the scale a certain node should have in the graph, off its title.
    //in the future maybe apply to json config as a fixed thing, thats scrolled through (between fixed values) via scrolling over node in edit mode?
    getNodeScale(title: string|null|undefined): number {
        if (this.getValueTypeFromTitle(title) === "mdpType") { return 2.5 }
        if (this.getValueTypeFromTitle(title) === "problemType") { return 1.5 }
        if (this.getValueTypeFromTitle(title) === "problemApproach") { return 0.8 }//because child node usually 
        if (this.getValueTypeFromTitle(title) === "horizonType") { return 0.6 }
        if (this.getValueTypeFromTitle(title) === "") { return 1 }
        return 1
    }


}

