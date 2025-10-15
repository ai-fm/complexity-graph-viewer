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
    currentGhostOffsetL = 0
    currentGhostOffsetT = 0
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

            const dropdown = document.getElementById("dropdownField") as HTMLSelectElement
            dropdown.disabled = optionsOpen; dropdown.hidden = optionsOpen
            const tdc = document.getElementById("MDPTypeDropdownContainer")
            if (optionsOpen) {
                const graphtitle = document.createElement("input")
                graphtitle.type = "text"
                graphtitle.contentEditable = "true";
                graphtitle.placeholder = "Enter graph title here.";
                graphtitle.value = "";
                graphtitle.id = "GraphTitleContainer"
                if (tdc != null) { tdc.appendChild(graphtitle) }
            } else {
                if (tdc != null) {
                    const gtc = document.getElementById("GraphTitleContainer")
                    if (gtc == null) { return }
                    tdc.removeChild(gtc)
                }

            }
        }
    }

    //fetch next free id in graphitems
    fetchNextFreeID(maxid: number, prefix = "", sibs?: Element[]): string {
        let taken = false;
        let siblings = sibs;
        siblings ??= graphMGR.graphitems

        siblings.forEach((el: { id: string }) => {
            if (el.id.includes("SP")) { return }
            if (el.id == (prefix + maxid)) { taken = true }
            p(el.id, prefix, maxid, el.id == (prefix + maxid))
        });
        if (taken == false) {
            return (prefix + maxid)
        }
        else {
            return this.fetchNextFreeID(maxid + 1, prefix, siblings)
        }
    }



    //this is a lot. maybe break into smaller chunks later.
    optionsSubmenu(type: string) {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }

        for (const i of this.activeOptionMenuElements) { i.remove() }

        if (type == "edit") {
            this.oec.style.textAlign = "center";

            const editModeExplanation = document.createElement("p")
            editModeExplanation.style.position = "relative"
            editModeExplanation.style.wordWrap = "break-word"
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
            createNewNode.title = "Click to create a node. Click that node again to name it."
            createNewNode.onclick = () => { this.makeGhostNode() }
            this.activeOptionMenuElements.push(createNewNode)
            this.oec.appendChild(createNewNode)

            this.makebreak()
            this.makebreak()

            const createChildNode = document.createElement("button")
            createChildNode.textContent = "Create child node"
            createChildNode.style.display = "inline"
            createChildNode.style.width = "90%"
            createNewNode.title = "Click to activate. While active, click a parent node to link it to, then a second place at which it will automatically generate linked to it."
            createChildNode.onclick = (event) => {
                createChildNode.style.color = "#0000ffff"
                createChildNode.style.borderColor = "#0000ffff"
                this.graphtextedit(false)
                event.stopImmediatePropagation()

                //this is potentially very inefficient-setting all graph elements onclicks to something else temporarily. I'll rework this when i have a working build. its not like its harmful, its just a bit inefficient.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any 
                const prev: any[] = [] //explicit any this time because its type annotation is a pain and event handlers need extra type. On later review, maybe rework
                for (const i of graphMGR.graphitems) {
                    prev.push(i.onclick)
                    i.onclick = () => {
                        createChildNode.style.color = "#000000ff"
                        createChildNode.style.borderColor = ""
                        this.graphtextedit(true)

                        this.makeGhostChildNode(i);

                        for (const j in graphMGR.graphitems) {
                            graphMGR.graphitems[j].onclick = prev[j]
                        }
                    }
                }
            }
            this.activeOptionMenuElements.push(createChildNode)
            this.oec.appendChild(createChildNode)
            this.makebreak()
            this.makebreak()

            const delNode = document.createElement("button")
            delNode.textContent = "Delete node"
            delNode.style.display = "inline"
            delNode.style.width = "90%"
            delNode.title = "Click this, and then click a node, in order to delete that node."
            delNode.onclick = (event) => {
                delNode.style.color = "#0000ffff"
                delNode.style.borderColor = "#0000ffff"
                this.graphtextedit(false)
                event.stopImmediatePropagation()

                //this is potentially very inefficient-setting all graph elements onclicks to something else temporarily. I'll rework this when i have a working build. its not like its harmful, its just a bit inefficient.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any 
                const prev: any[] = [] //explicit any this time because its type annotation is a pain and event handlers need extra type. On later review, maybe rework
                for (const i of graphMGR.graphitems) {
                    prev.push(i.onclick)
                    i.onclick = () => {
                        delNode.style.color = "#000000ff"
                        delNode.style.borderColor = ""
                        this.graphtextedit(true)
                        for (const j in graphMGR.graphitems) {
                            graphMGR.graphitems[j].onclick = prev[j]
                        }

                        i.remove();


                        const recursiveRemove = (elem: HTMLElement) => {
                            graphMGR.graphitems.splice(graphMGR.graphitems.indexOf(elem), 1)
                            const candidate = graphMGR.findItemById(elem.id)
                            if (candidate != undefined) { graphMGR.graphitemdata.splice(graphMGR.graphitemdata.indexOf(candidate), 1) }
                            for (const child of elem.children) {
                                if (child.id.includes("SP")) { continue }
                                recursiveRemove(child as HTMLElement)
                            }
                        }
                        recursiveRemove(i)
                        p(graphMGR.graphitems)
                    }
                }
            }
            this.activeOptionMenuElements.push(delNode)
            this.oec.appendChild(delNode)


            this.makebreak()
            this.makebreak()

            const createNewConn = document.createElement("button")
            createNewConn.textContent = "Create new connector"
            createNewConn.style.display = "inline"
            createNewConn.style.width = "90%"
            createNewConn.title = "Click two nodes to create or delete a connection between them."
            createNewConn.onclick = (event) => {
                createNewConn.style.color = "#0000ffff"
                createNewConn.style.borderColor = "#0000ffff"

                this.graphtextedit(false)
                event.stopImmediatePropagation()


                let from: string | null = null
                let to: string | null = null
                const type = "line"
                //this is potentially very inefficient-setting all graph elements onclicks to something else temporarily. I'll rework this when i have a working build. its not like its harmful, its just a bit inefficient.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any 
                const prev: any[] = [] //explicit any this time because its type annotation is a pain and event handlers need extra type. On later review, maybe rework
                for (const i of graphMGR.graphitems) {
                    prev.push(i.onclick)
                    i.onclick = () => {
                        if (from == null) {
                            createNewConn.style.color = "#00ff00ff"
                            createNewConn.style.borderColor = "#00ff00ff"
                            from = i.id;
                            p("a", from)
                            event.stopImmediatePropagation()
                        }
                        else {

                            to = i.id;
                            p("b", from, to)
                            createNewConn.style.color = "#000000ff"
                            createNewConn.style.borderColor = ""
                            for (const j in graphMGR.graphitems) {
                                graphMGR.graphitems[j].onclick = prev[j]
                            }
                            graphMGR.conns ??= []
                            let inConnections = false;
                            let conn
                            for (const i of graphMGR.conns) {
                                if (
                                    i.idFrom == from && i.idTo == to
                                ) { inConnections = true; conn = i }
                            }
                            p(conn)
                            conn ??= { idFrom: from, idTo: to, type }
                            if (inConnections) {
                                graphMGR.conns.splice(graphMGR.conns.indexOf(conn), 1)
                            }
                            else {
                                graphMGR.conns.push(conn)
                            }
                            graphMGR.loadConnectors()
                            event.stopImmediatePropagation()
                        }
                        p(from, to)
                    }
                }



            }
            this.activeOptionMenuElements.push(createNewConn)
            this.oec.appendChild(createNewConn)

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
            downloadName.id = "A form field element should have an id or name attribute"
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

            this.graphtextedit(true)

        }
        else if (type == "hide") {
            this.graphtextedit(false)
        }
    }

    graphtextedit(bool: boolean) {
        for (const i of graphMGR.graphitemtext) {
            i.contentEditable = "" + bool;
        }
    }

    makeGhostNode() {
        const node = new graphDataNode
        node.type = "ClickableGraphNode"
        node.title = "<>"
        node.id = this.fetchNextFreeID(1);
        node.children = []
        node.childDegree = 0
        graphMGR.loadGraphElem(node)
        document.getElementById(node.id)?.dispatchEvent(new MouseEvent('dblclick'))
        const sp = document.getElementById(node.id + "SP"); if (sp != null) { sp.contentEditable = "true"; } //maybe clean this part up?
    }




    makeGhostChildNode(parent: HTMLElement) {
        const node = new graphDataNode
        node.type = "ClickableSubNode"
        node.title = "<>"
        node.id = this.fetchNextFreeID(1, parent.id + ".", [...parent.children])
        node.children = []

        node.posX = 0;
        node.posY = 20;
        graphMGR.loadGraphElem(node, parent)

        for (const i of graphMGR.graphitemdata) {
            if (i.id == parent.id) {
                i.children ??= []
                let deg = i.childDegree; deg ??= 0
                node.childDegree = deg + 1
                const elem = document.getElementById(node.id)
                p(elem, node.childDegree)
                if (elem != null) { elem.style.transform = "scale(" + ((node.childDegree > 0) ? 0.75 : 1) + ")" }

                i.children.push(node)
            }
        }



        document.getElementById(node.id)?.dispatchEvent(new MouseEvent('dblclick'))
        const sp = document.getElementById(node.id + "SP"); if (sp != null) { sp.contentEditable = "true"; } //maybe clean this part up?
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
        this.graphtextedit(false)
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

    fetchGhostOffset(node: HTMLElement) {
        if (node.parentElement == null) { p("node parent is null somehow? error!"); return [Infinity, Infinity] }
        if (node.parentElement == graphMGR.gvc) { return [0, 0] }

        let x = 0, y = 0

        x += parseFloat(node.parentElement.style.left)
        y += parseFloat(node.parentElement.style.top)

        x += this.fetchGhostOffset(node.parentElement)[0];
        y += this.fetchGhostOffset(node.parentElement)[1];

        return [x, y]
    }

    setNewPos(i: graphDataNode, node: HTMLElement) {
        if (i.id == node.id) {
            i.posX = parseFloat(node.style.left)
            i.posY = parseFloat(node.style.top)

        }
        if (i.children != undefined) {
            for (const j of i.children) { this.setNewPos(j, node) }
        }
    }
    handleElemClick(node: HTMLElement) {
        //still sort of buggy. but good enough for now
        this.activeEditNode = node
        this.currentGhostOffsetL = this.fetchGhostOffset(this.activeEditNode)[0]
        this.currentGhostOffsetT = this.fetchGhostOffset(this.activeEditNode)[1]


        const prev = this.activeEditNode.onclick
        const gvcprev = graphMGR.gvc.onclick
        const gvcp = graphMGR.gvc.parentElement; if (gvcp == null) { return }
        const gvcpprev = gvcp.onclick

        this.activeEditNode.onclick = (event) => {
            if (this.activeEditNode != null) {
                for (const i of graphMGR.graphitemdata) {
                    this.setNewPos(i, node)
                }
                gvcp.onclick = gvcpprev
                graphMGR.gvc.onclick = gvcprev
                this.activeEditNode.onclick = prev
                this.activeEditNode.style.opacity = "1"
                this.activeEditNode = null
                event.stopPropagation()
            }
        }
        graphMGR.gvc.onclick = (event) => {
            if (this.activeEditNode != null) {
                for (const i of graphMGR.graphitemdata) {
                    this.setNewPos(i, node)
                }
                gvcp.onclick = gvcpprev
                graphMGR.gvc.onclick = gvcprev
                this.activeEditNode.onclick = prev
                this.activeEditNode.style.opacity = "1"
                this.activeEditNode = null
                event.stopPropagation()
            }
        }
        gvcp.onclick = (event) => {
            if (this.activeEditNode != null) {
                for (const i of graphMGR.graphitemdata) {
                    this.setNewPos(i, node)
                }
                gvcp.onclick = gvcpprev
                graphMGR.gvc.onclick = gvcprev
                this.activeEditNode.onclick = prev
                this.activeEditNode.style.opacity = "1"
                this.activeEditNode = null
                event.stopPropagation()
            }
        }
    }




}



