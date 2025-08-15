import { graphDataNode } from "./graph_nodes/GraphManager"
import { graphMGR, optionsOpen, p, setOptionsOpen } from "./main"

export class optionsController {
    //options menu button, generated in MDPApp
    obtn: HTMLImageElement | null = null
    //options elements container
    oec: HTMLDivElement | null = null

    activeOptionMenuElements: HTMLElement[] = []

    //node currently being edited
    activeEditNode: HTMLElement | null = null
    //extra var used to fix parent nodes getting selected alongside child nodes
    editNodeParent: HTMLElement | null | undefined = null

    ////
    ////Initialise options button and menu.
    ////
    initOptions() {
        this.oec = document.getElementById("InformationContainer") as HTMLDivElement
        this.obtn = document.getElementById("optionsButton") as HTMLImageElement
        this.obtn.onclick = () => {
            setOptionsOpen(!optionsOpen)
            if (optionsOpen) {
                if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
                graphMGR.undisplayNodeData()
                this.oec.style.overflowY = "hidden"
                this.oec.style.overflowX = "hidden"
                //lateron this will be a submenu next to other settings, accessed by a button. Right now its gonna be the only setting
                //this.optionsMenu()
                this.optionsSubmenu("edit")
            }
            if (this.oec == null) { p("OptionsMenuContainerDiv is empty!"); return }
            this.oec.style.border = optionsOpen ? "0.5vh solid #f32121" : "0.5vh solid #21f3f0"
            for (const i of this.activeOptionMenuElements) { i.style.visibility = optionsOpen ? "visible" : "hidden" }
        }
    }


    optionsSubmenu(type: string) {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }

        for (const i of this.activeOptionMenuElements) { i.remove() }

        if (type == "edit") {
            this.oec.style.textAlign = "center";

            const editModeExplanation = document.createElement("p")
            editModeExplanation.style = "position:relative;word-wrap: break-word;"
            editModeExplanation.textContent = "Welcome to the graph editor. You can customize a graph using the buttons and fields below. If you are unsure what a button does, just hover over it for a tooltip. Changes here don't affect the graph configs. To export this graph, simply hit the download button and move it into \\src\\complexity_graph_configs."
            this.activeOptionMenuElements.push(editModeExplanation)
            this.oec.appendChild(editModeExplanation)

            const clearCanvasBTN = document.createElement("button")
            clearCanvasBTN.textContent = "Clear canvas"
            clearCanvasBTN.style.display = "inline"
            clearCanvasBTN.style.width = "90%"
            clearCanvasBTN.title = "Clears the entire canvas and the data structures generating it, allowing you to start fresh."
            clearCanvasBTN.onclick = () => { graphMGR.unloadGraphItems(); graphMGR.conns = []; graphMGR.loadConnectors() }
            this.activeOptionMenuElements.push(clearCanvasBTN)
            this.oec.appendChild(clearCanvasBTN)

            this.makebreak()
            this.makebreak()

            const createNewNode = document.createElement("button")
            createNewNode.textContent = "Create new node"
            createNewNode.style.display = "inline"
            createNewNode.style.width = "90%"
            createNewNode.title = "Click to activate. While active, click anywhere on the graph viewer to place it down at that spot."
            createNewNode.onclick = () => {
                createNewNode.style.color = "#0000ffff"
                createNewNode.style.borderColor = "#0000ffff"
                const ghost = new graphDataNode
                ghost.type = "ClickableGraphNode"
                //title ?: string; node title Enter text field before this?
                //id!: string; set to next free ID 
                this.makeGhostNode(ghost)
            }
            this.activeOptionMenuElements.push(createNewNode)
            this.oec.appendChild(createNewNode)

            this.makebreak()
            this.makebreak()

            const createChildNode = document.createElement("button")
            createChildNode.textContent = "Create child node"
            createChildNode.style.display = "inline"
            createChildNode.style.width = "90%"
            createNewNode.title = "Click to activate. While active, click a parent node to link it to, then a second place at which it will automatically generate linked to it."
            createChildNode.onclick = () => {
                createChildNode.style.color = "#0000ffff"
                createChildNode.style.borderColor = "#0000ffff"
            }
            this.activeOptionMenuElements.push(createChildNode)
            this.oec.appendChild(createChildNode)

            this.makebreak()
            this.makebreak()

            const downloadName = document.createElement("input")
            downloadName.placeholder = "Name the resulting json file."
            downloadName.style.display = "inline"
            downloadName.style.paddingLeft = "2.5%"
            downloadName.style.paddingRight = "2.5%"
            downloadName.style.border = "0"
            downloadName.style.width = "85%"
            downloadName.title = "This name is used for the file you download. If left blank, uses element name instead."
            this.activeOptionMenuElements.push(downloadName)
            this.oec.appendChild(downloadName)

            this.makebreak()

            const downloadBTN = document.createElement("button")
            downloadBTN.textContent = "Download Graph"
            downloadBTN.title = "Press here to download the graph as a json."
            downloadBTN.onclick = () => { graphMGR.download(downloadName.value) }
            downloadBTN.style.display = "inline"
            downloadBTN.style.width = "90%"
            this.activeOptionMenuElements.push(downloadBTN)
            this.oec.appendChild(downloadBTN)
        }
        else if (type == "hide") { ; }
    }

    makeGhostNode(node: graphDataNode) {
        node.children = []
        node.childDegree = 0
        graphMGR.loadGraphElem(node)
    }

    makebreak() {
        const br = document.createElement("br")
        this.oec?.appendChild(br)
        this.activeOptionMenuElements.push(br)
    }



    closeOptions() {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
        setOptionsOpen(false)
        this.oec.style.border = "0.5vh solid #21f3f0"
        this.optionsSubmenu("hide")
    }


    handleDivMovement(event: MouseEvent) {
        if (this.activeEditNode != null) {
            graphMGR.handleGhostMovement(this.activeEditNode, event);
        }
        else {
            graphMGR.handleMouseMoveEvent(event)
        }
    }

    handleElemMovement(event: MouseEvent) {
        if (this.activeEditNode != null) {
            graphMGR.handleGhostMovement(this.activeEditNode, event);
        }
    }

    handleElemClick(node: HTMLElement) {

        this.activeEditNode = node
        const prev = this.activeEditNode.onclick
        //const prevGVC=graphMGR.gvc.onclick
        this.activeEditNode.onclick = (event) => {
            if (this.activeEditNode != null) {
                this.activeEditNode.onclick = prev//() => { ; }
                this.activeEditNode.style.opacity = "1"
                this.activeEditNode = null
                event.stopPropagation()
            }
        }
    }

}



