import { Octokit } from "@octokit/core";
import { decode, encode, optionsOpen, p, setOptionsOpen, } from "./global";
import { graphDataNode, GraphManager } from "./GraphManager";

function openBigJSON() {
    const parent = document.getElementById("appContainer")
    if (parent == null) { return }

    let frame = document.getElementById("fullscreenView")

    if (frame == null) {
        frame = document.createElement("div")
        frame.id = "fullscreenView"
        frame.style.border = "0.5vh solid #21f3f0"
        frame.style.backgroundColor = " #ffffff"
        frame.style.borderRadius = "5%"
        frame.style.margin = "2.5vh"
        frame.style.width = "97%"
        frame.style.height = "95%"
        frame.style.position = "absolute"
        frame.style.zIndex = "99"
        parent.prepend(frame)
    }
    else {
        frame.style.visibility = "visible"
    }

    let btn = document.getElementById("fullscreenExit")
    if (btn == null) {
        btn = document.createElement("button")
        btn.id = "fullscreenExit"
        btn.style.top = "0"
        btn.style.left = "0"
        btn.textContent = "X"
        btn.onclick = () => { closeBigJSON() }
    }
    frame.prepend(btn)

    let editWindow = document.getElementById("editWindow")
    if (editWindow == null) {
        editWindow = document.createElement("div")
        editWindow.id = "editWindow"
        editWindow.style.height = "90%"
        frame.appendChild(editWindow)
    }

    let buttonContainer = document.getElementById("bigJSONbtnContainer")
    if (buttonContainer == null) {
        buttonContainer = document.createElement("div")
        buttonContainer.id = "bigJSONbtnContainer"
        buttonContainer.style.display = "flex"
        buttonContainer.style.justifyContent = "space-around"
        buttonContainer.style.alignItems = "center"
        frame.appendChild(buttonContainer)
    }

    let prev = document.getElementById("prevPage")
    if (prev == null) {
        prev = document.createElement("button")
        prev.id = "prevPage"
        prev.textContent = "<"
        prev.style.scale = "300%"
        buttonContainer.appendChild(prev)
    }

    let dlButton = document.getElementById("downloadCurrentJson")
    if (dlButton == null) {
        dlButton = document.createElement("button")
        dlButton.id = "downloadCurrentJson"
        dlButton.textContent = "Download"
        dlButton.style.scale = "300%"
        buttonContainer.appendChild(dlButton)
    }

    let ulButton = document.getElementById("uploadCurrentJson")
    if (ulButton == null) {
        ulButton = document.createElement("button")
        ulButton.id = "uploadCurrentJson"
        ulButton.textContent = "Upload"
        ulButton.style.scale = "300%"
        buttonContainer.appendChild(ulButton)
    }
    let next = document.getElementById("nextPage");
    if (next == null) {
        next = document.createElement("button");
        next.id = "nextPage";
        next.textContent = ">";
        next.style.scale = "300%";
        buttonContainer.appendChild(next);
    }

    return [editWindow, prev, dlButton, ulButton, next]
}

function closeBigJSON() {

    const editWindowElems = document.querySelectorAll(".editWindow")
    editWindowElems.forEach(e => { e.remove() })
    const editWindowSubElems = document.querySelectorAll(".editWindowSub")
    editWindowSubElems.forEach(e => { e.remove() })
    const frame = document.getElementById("fullscreenView")
    if (frame == null) { return }
    frame.style.visibility = "hidden"
}


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

    //count of current page in editing. Basically, to allow flipping through results.
    editPageCount = 0

    graphMGR: GraphManager;

    ////
    ////Initialise options button and menu.
    ////
    constructor(graphMGR: GraphManager) {
        this.graphMGR = graphMGR
        this.oec = document.getElementById("InformationContainer") as HTMLDivElement
        this.obtn = document.getElementById("optionsButton") as HTMLImageElement

        this.obtn.onclick = () => {
            setOptionsOpen(!optionsOpen)
            if (optionsOpen) {
                if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
                graphMGR.undisplayNodeData()
                this.oec.style.overflowY = "hidden"
                this.oec.style.overflowX = "hidden"
                this.optionsMenu()
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
        siblings ??= this.graphMGR.graphitems

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

    // The options menu. Leads to submenus.
    optionsMenu() {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
        for (const i of this.activeOptionMenuElements) { i.remove() }
        this.oec.style.textAlign = "center";
        this.makebreak()


        const openAddResults = document.createElement("button")
        openAddResults.textContent = "Add new results or edit valid values of results."
        openAddResults.style.display = "inline"
        openAddResults.style.width = "90%"
        openAddResults.title = "Click to open related submenu."
        openAddResults.onclick = () => { this.optionsAddResults() }
        this.activeOptionMenuElements.push(openAddResults)
        this.oec.appendChild(openAddResults)

        this.makebreak()
        this.makebreak()

        const openCustomizeApp = document.createElement("button")
        openCustomizeApp.textContent = "Customize the app. Unimplemented."
        openCustomizeApp.style.display = "inline"
        openCustomizeApp.style.width = "90%"
        openCustomizeApp.title = "Click to open related submenu."
        openCustomizeApp.onclick = () => { this.optionsCustomizeApp() }
        this.activeOptionMenuElements.push(openCustomizeApp)
        this.oec.appendChild(openCustomizeApp)

        this.makebreak()
        this.makebreak()

        const openEditGraph = document.createElement("button")
        openEditGraph.textContent = "Edit the current graph or create a new one."
        //TODO CHECK FOR DUPLICATE GRAPH TYPES!
        openEditGraph.style.display = "inline"
        openEditGraph.style.width = "90%"
        openEditGraph.title = "Click to open related submenu."
        openEditGraph.onclick = () => { this.optionsEditGraph() }
        this.activeOptionMenuElements.push(openEditGraph)
        this.oec.appendChild(openEditGraph)
    }

    // Upload to the repository.
    async upload_json(token: string, owner: string, repo: string, path: string, message: string, content: string, sha: string | undefined) {
        const octokit = new Octokit({
            auth: token
        })

        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: owner,
            repo: repo,
            path: path,
            message: message,
            committer: {
                name: 'Complexity-graph submission',
                email: 'none@none.none'
            },
            content: content,
            sha: sha,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
    }

    // Download from the repository.
    async fetch_json(token: string, owner: string, repo: string, path: string) {
        const octokit = new Octokit({
            auth: token
        })

        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: owner,
            repo: repo,
            path: path,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })

        return response.data
    }

    fetchAndEditValid(token: string) {
        const owner = 'ClemRub'
        const repo = 'complexity-jsons'
        const path = 'valid_values/node-category-values.json'

        this.fetch_json(token, owner, repo, path).then(fetched => {

            let content = JSON.parse("{}")
            if (('content' in fetched) && (typeof fetched.content == typeof "")) {
                content = JSON.parse(decode(fetched.content as string))
            }

            let sha: string | undefined = undefined
            if (('sha' in fetched) && (typeof fetched.sha == typeof "")) {
                sha = fetched.sha as string
            }
            const candidate = openBigJSON()

            if (candidate == undefined) { return }

            const [editWindow, prev, dlButton, ulButton, next] = candidate
            const keys: string[] = []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const values: any[] = []

            let x: keyof typeof content
            for (x in content) {
                keys.push(x)
                values.push(content[x])
            }

            this.editPageCount = 0

            const windowTitle = document.createElement("span")
            windowTitle.className = "editWindow"
            windowTitle.textContent = keys[this.editPageCount] as string
            windowTitle.onclick = () => windowTitle.contentEditable = "true"
            editWindow.appendChild(windowTitle)
            const TitleRuler = document.createElement("hr")
            TitleRuler.className = "editWindow"
            editWindow.appendChild(TitleRuler)

            let value_elems = new Array(values[this.editPageCount].length).fill([])


            for (const i in values[this.editPageCount]) {
                const windowElem = document.createElement("div")
                windowElem.className = "editWindowSub"
                windowElem.style.display = "flex"
                windowElem.style.flexWrap = "wrap"
                const vals = []
                for (const j of values[this.editPageCount][i]) {
                    const elem = document.createElement("div")
                    elem.style.border = "0.1vh solid #21f3f0"
                    elem.style.margin = "0.1vh"
                    elem.className = "editWindowSub"
                    elem.onclick = () => elem.contentEditable = "true"
                    elem.textContent = j
                    vals.push(elem)
                    windowElem.appendChild(elem)
                }
                value_elems[parseInt(i)] = vals
                const elem = document.createElement("div")
                elem.style.border = "0.1vh solid #21f3f0"
                elem.style.margin = "0.1vh"
                elem.className = "editWindowSub"
                elem.textContent = "+"
                elem.onclick = () => {
                    const newElem = document.createElement("div")
                    newElem.className = "editWindowSub"
                    newElem.style.border = "0.1vh solid #21f3f0"
                    newElem.onclick = () => newElem.contentEditable = "true"
                    newElem.style.margin = "0.1vh"
                    newElem.textContent = "new"
                    value_elems[parseInt(i)].push(newElem)
                    windowElem.insertBefore(newElem, elem)
                }
                windowElem.appendChild(elem)

                editWindow.appendChild(windowElem)

                const elemRuler = document.createElement("hr")
                elemRuler.className = "editWindowSub"
                editWindow.appendChild(elemRuler)
            }
            const windowPlus = document.createElement("span")
            windowPlus.className = "editWindowSub"
            windowPlus.textContent = "+"
            windowPlus.style.border = "0.1vh solid #21f3f0"
            windowPlus.style.margin = "0.1vh"
            editWindow.appendChild(windowPlus)

            prev.onclick = () => {
                updateValues(this.editPageCount)

                value_elems = new Array(values[this.editPageCount].length).fill([])
                this.editPageCount -= 1
                if (this.editPageCount < 0) { this.editPageCount = keys.length - 1 }

                windowTitle.textContent = keys[this.editPageCount] as string
                const editWindowSubElems = document.querySelectorAll(".editWindowSub")
                editWindowSubElems.forEach(e => { e.remove() })
                for (const i in values[this.editPageCount]) {
                    const windowElem = document.createElement("div")
                    windowElem.className = "editWindowSub"
                    windowElem.style.display = "flex"
                    windowElem.style.flexWrap = "wrap"

                    const vals = []
                    for (const j of values[this.editPageCount][i]) {
                        const elem = document.createElement("div")
                        elem.className = "editWindowSub"
                        elem.style.border = "0.1vh solid #21f3f0"
                        elem.onclick = () => elem.contentEditable = "true"
                        elem.style.margin = "0.1vh"
                        elem.textContent = j
                        vals.push(elem)
                        windowElem.appendChild(elem)
                    }
                    value_elems[parseInt(i)] = vals
                    const elem = document.createElement("div")
                    elem.className = "editWindowSub"
                    elem.style.border = "0.1vh solid #21f3f0"
                    elem.style.margin = "0.1vh"
                    elem.textContent = "+"
                    elem.onclick = () => {
                        const newElem = document.createElement("div")
                        newElem.className = "editWindowSub"
                        newElem.style.border = "0.1vh solid #21f3f0"
                        newElem.onclick = () => newElem.contentEditable = "true"
                        newElem.style.margin = "0.1vh"
                        newElem.textContent = "new"
                        value_elems[parseInt(i)].push(newElem)
                        windowElem.insertBefore(newElem, elem)
                    }
                    windowElem.appendChild(elem)

                    editWindow.appendChild(windowElem)

                    const elemRuler = document.createElement("hr")
                    elemRuler.className = "editWindowSub"
                    editWindow.appendChild(elemRuler)
                }
                const windowPlus = document.createElement("span")
                windowPlus.className = "editWindowSub"
                windowPlus.textContent = "+"
                windowPlus.style.border = "0.1vh solid #21f3f0"
                windowPlus.style.margin = "0.1vh"
                editWindow.appendChild(windowPlus)

            }

            next.onclick = () => {
                updateValues(this.editPageCount)

                value_elems = new Array(values[this.editPageCount].length).fill([])
                this.editPageCount += 1
                if (this.editPageCount == keys.length) { this.editPageCount = 0 }

                windowTitle.textContent = keys[this.editPageCount] as string
                const editWindowSubElems = document.querySelectorAll(".editWindowSub")
                editWindowSubElems.forEach(e => { e.remove() })

                for (const i in values[this.editPageCount]) {
                    const windowElem = document.createElement("div")
                    windowElem.className = "editWindowSub"
                    windowElem.style.display = "flex"
                    windowElem.style.flexWrap = "wrap"

                    const vals = []
                    for (const j of values[this.editPageCount][i]) {
                        const elem = document.createElement("div")
                        elem.className = "editWindowSub"
                        elem.style.border = "0.1vh solid #21f3f0"
                        elem.style.margin = "0.1vh"
                        elem.onclick = () => elem.contentEditable = "true"
                        elem.textContent = j
                        vals.push(elem)
                        windowElem.appendChild(elem)
                    }
                    value_elems[parseInt(i)] = vals
                    const elem = document.createElement("div")
                    elem.className = "editWindowSub"
                    elem.style.border = "0.1vh solid #21f3f0"
                    elem.style.margin = "0.1vh"
                    elem.textContent = "+"
                    elem.onclick = () => {
                        const newElem = document.createElement("div")
                        newElem.className = "editWindowSub"
                        newElem.style.border = "0.1vh solid #21f3f0"
                        newElem.onclick = () => newElem.contentEditable = "true"
                        newElem.style.margin = "0.1vh"
                        newElem.textContent = "new"
                        value_elems[parseInt(i)].push(newElem)
                        windowElem.insertBefore(newElem, elem)
                    }
                    windowElem.appendChild(elem)

                    editWindow.appendChild(windowElem)

                    const elemRuler = document.createElement("hr")
                    elemRuler.className = "editWindowSub"
                    editWindow.appendChild(elemRuler)
                }
                const windowPlus = document.createElement("span")
                windowPlus.className = "editWindowSub"
                windowPlus.textContent = "+"
                windowPlus.style.border = "0.1vh solid #21f3f0"
                windowPlus.style.margin = "0.1vh"
                editWindow.appendChild(windowPlus)
            }

            function updateValues(page: number) {


                const newValues = []
                for (const i in value_elems) {
                    const temp = []
                    for (const j of value_elems[i]) {
                        if (j.textContent != "new") {
                            temp.push(j.textContent)
                        }
                    }
                    if (temp.length != 0) {
                        newValues.push(temp)
                    }
                }

                values[page] = newValues
                keys[page] = windowTitle.textContent
            }

            function getContent(page: number) {
                updateValues(page)
                let content = "{"
                for (const i in keys) {
                    if (keys[i] == keys[0]) {
                        content += "\"" + keys[i] + "\": ["

                        for (const j of values[i]) {
                            if (j == values[i][0]) {
                                content += "["

                                for (const k of j) {
                                    if (k == j[0]) {
                                        content += "\"" + k + "\""
                                    }
                                    else {
                                        content += ",\"" + k + "\""
                                    }
                                }

                                content += "]"
                            }
                            else {
                                content += ",["
                                for (const k of j) {
                                    if (k == j[0]) {
                                        content += "\"" + k + "\""
                                    }
                                    else {
                                        content += ",\"" + k + "\""
                                    }
                                }

                                content += "]"
                            }


                        }

                    }
                    else {

                        content += ",\"" + keys[i] + "\": ["

                        for (const j of values[i]) {
                            if (j == values[i][0]) {
                                content += "["
                                for (const k of j) {
                                    if (k == j[0]) {
                                        content += "\"" + k + "\""
                                    }
                                    else {
                                        content += ",\"" + k + "\""
                                    }
                                }
                                content += "]"

                            }
                            else {
                                content += ",["
                                for (const k of j) {
                                    if (k == j[0]) {
                                        content += "\"" + k + "\""
                                    }
                                    else {
                                        content += ",\"" + k + "\""
                                    }
                                }
                                content += "]"
                            }

                        }

                    }
                    content += "]"
                }
                content += "}"
                return JSON.parse(content)
            }


            dlButton.onclick = () => {
                content = JSON.stringify(getContent(this.editPageCount))
                const a = document.createElement("a");
                const file = new Blob([content], { type: "text/json" });;
                a.href = URL.createObjectURL(file);
                a.download = "node-category-values.json";
                a.click();

            }

            ulButton.onclick = async () => {
                const obj = getContent(this.editPageCount)
                const encoded = encode(JSON.stringify(obj, null, 2))
                this.upload_json(token, owner, repo, path, "Uploading new Category Jsons.", encoded, sha)
                const octokit = new Octokit({
                    auth: token
                })

                const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                    owner: owner,
                    repo: repo,
                    path: path,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                })
                if ('sha' in response.data) {
                    sha = response.data.sha
                }
            }
        })
    }



    optionsAddResults() {

        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }

        for (const i of this.activeOptionMenuElements) { i.remove() }

        this.oec.style.textAlign = "center";

        this.optionsEditHide()

        this.makebreak()

        const Vtoken = document.createElement("input")
        Vtoken.placeholder = "Github access token. Not stored but not secure; better than perma uploading one. better solution TBD"
        Vtoken.style.display = "inline"
        Vtoken.style.paddingLeft = "2.5%"
        Vtoken.style.paddingRight = "2.5%"
        Vtoken.style.border = "0"
        Vtoken.style.width = "85%"
        Vtoken.title = "Github access token. Not stored but not secure; better than perma uploading one. better solution TBD"
        Vtoken.id = "A form field element should have an id or name attribute"
        Vtoken.autocomplete = "off"
        this.activeOptionMenuElements.push(Vtoken)
        this.oec.appendChild(Vtoken)
        this.makebreak()

        const editValidBTN = document.createElement("button")
        editValidBTN.textContent = "Edit the valid possible values for entries in the graph."
        editValidBTN.title = "Valid category edit"
        editValidBTN.onclick = () => {
            this.fetchAndEditValid(Vtoken.value)
        }
        editValidBTN.style.display = "inline"
        editValidBTN.style.width = "90%"
        this.activeOptionMenuElements.push(editValidBTN)
        this.oec.appendChild(editValidBTN)



        this.graphtextedit(true)
    }

    optionsCustomizeApp() {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }

        for (const i of this.activeOptionMenuElements) { i.remove() }

        this.oec.style.textAlign = "center";

        this.optionsEditHide()

        this.makebreak()

    }

    optionsEditGraph() {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }

        for (const i of this.activeOptionMenuElements) { i.remove() }

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
        clearCanvasBTN.onclick = () => { this.graphMGR.unloadGraphItems(); this.graphMGR.conns = []; this.graphMGR.loadConnectors() }
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
            for (const i of this.graphMGR.graphitems) {
                prev.push(i.onclick)
                i.onclick = () => {
                    createChildNode.style.color = "#000000ff"
                    createChildNode.style.borderColor = ""
                    this.graphtextedit(true)

                    this.makeGhostChildNode(i);

                    for (const j in this.graphMGR.graphitems) {
                        this.graphMGR.graphitems[j].onclick = prev[j]
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
            for (const i of this.graphMGR.graphitems) {
                prev.push(i.onclick)
                i.onclick = () => {
                    delNode.style.color = "#000000ff"
                    delNode.style.borderColor = ""
                    this.graphtextedit(true)
                    for (const j in this.graphMGR.graphitems) {
                        this.graphMGR.graphitems[j].onclick = prev[j]
                    }

                    i.remove();


                    const recursiveRemove = (elem: HTMLElement) => {
                        this.graphMGR.graphitems.splice(this.graphMGR.graphitems.indexOf(elem), 1)
                        const candidate = this.graphMGR.findItemById(elem.id)
                        if (candidate != undefined) { this.graphMGR.graphitemdata.splice(this.graphMGR.graphitemdata.indexOf(candidate), 1) }
                        for (const child of elem.children) {
                            if (child.id.includes("SP")) { continue }
                            recursiveRemove(child as HTMLElement)
                        }
                    }
                    recursiveRemove(i)
                    p(this.graphMGR.graphitems)
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
            for (const i of this.graphMGR.graphitems) {
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
                        for (const j in this.graphMGR.graphitems) {
                            this.graphMGR.graphitems[j].onclick = prev[j]
                        }
                        this.graphMGR.conns ??= []
                        let inConnections = false;
                        let conn
                        for (const i of this.graphMGR.conns) {
                            if (
                                i.idFrom == from && i.idTo == to
                            ) { inConnections = true; conn = i }
                        }
                        p(conn)
                        conn ??= { idFrom: from, idTo: to, type }
                        if (inConnections) {
                            this.graphMGR.conns.splice(this.graphMGR.conns.indexOf(conn), 1)
                        }
                        else {
                            this.graphMGR.conns.push(conn)
                        }
                        this.graphMGR.loadConnectors()
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
        downloadBTN.onclick = () => { this.graphMGR.download(downloadName.value) }
        downloadBTN.style.display = "inline"
        downloadBTN.style.width = "90%"
        this.activeOptionMenuElements.push(downloadBTN)
        this.oec.appendChild(downloadBTN)


    }

    optionsEditHide() {
        this.graphtextedit(false)

    }


    graphtextedit(bool: boolean) {
        for (const i of this.graphMGR.graphitemtext) {
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
        this.graphMGR.loadGraphElem(node)
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
        this.graphMGR.loadGraphElem(node, parent)

        for (const i of this.graphMGR.graphitemdata) {
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
        this.optionsEditHide()
        this.graphtextedit(false)
    }


    handleDivMovement(event: MouseEvent) {
        if (this.activeEditNode != null) {
            this.handleGhostMovement(this.activeEditNode, event);
        }
        else {
            this.graphMGR.handleMouseMoveEvent(event)
        }
    }

    handleElemMovement(event: MouseEvent) {
        if (this.activeEditNode != null) {
            this.handleGhostMovement(this.activeEditNode, event);
        }
    }

    fetchGhostOffset(node: HTMLElement) {
        if (node.parentElement == null) { p("node parent is null somehow? error!"); return [Infinity, Infinity] }
        if (node.parentElement == this.graphMGR.gvc) { return [0, 0] }

        let x = 0, y = 0

        x += parseFloat(node.parentElement.style.left)
        y += parseFloat(node.parentElement.style.top)

        x += this.fetchGhostOffset(node.parentElement)[0];
        y += this.fetchGhostOffset(node.parentElement)[1];

        return [x, y]
    }

    // Move only the ghost class elements. Which should only be the last activated element.
    handleGhostMovement(node: HTMLElement, event: MouseEvent) {
        const offsetx = this.graphMGR.gvc.getBoundingClientRect().left + 0.5 * node.getBoundingClientRect().width + this.currentGhostOffsetL
        const offsety = this.graphMGR.gvc.getBoundingClientRect().top + 0.5 * node.getBoundingClientRect().height + this.currentGhostOffsetT
        node.style.left = (event.x - offsetx) / this.graphMGR.zoom + "px"
        node.style.top = (event.y - offsety) / this.graphMGR.zoom + "px"

        this.graphMGR.loadConnectors()
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
        const gvcprev = this.graphMGR.gvc.onclick
        const gvcp = this.graphMGR.gvc.parentElement; if (gvcp == null) { return }
        const gvcpprev = gvcp.onclick

        this.activeEditNode.onclick = (event) => {
            if (this.activeEditNode != null) {
                for (const i of this.graphMGR.graphitemdata) {
                    this.setNewPos(i, node)
                }
                gvcp.onclick = gvcpprev
                this.graphMGR.gvc.onclick = gvcprev
                this.activeEditNode.onclick = prev
                this.activeEditNode.style.opacity = "1"
                this.activeEditNode = null
                event.stopPropagation()
            }
        }
        this.graphMGR.gvc.onclick = (event) => {
            if (this.activeEditNode != null) {
                for (const i of this.graphMGR.graphitemdata) {
                    this.setNewPos(i, node)
                }
                gvcp.onclick = gvcpprev
                this.graphMGR.gvc.onclick = gvcprev
                this.activeEditNode.onclick = prev
                this.activeEditNode.style.opacity = "1"
                this.activeEditNode = null
                event.stopPropagation()
            }
        }
        gvcp.onclick = (event) => {
            if (this.activeEditNode != null) {
                for (const i of this.graphMGR.graphitemdata) {
                    this.setNewPos(i, node)
                }
                gvcp.onclick = gvcpprev
                this.graphMGR.gvc.onclick = gvcprev
                this.activeEditNode.onclick = prev
                this.activeEditNode.style.opacity = "1"
                this.activeEditNode = null
                event.stopPropagation()
            }
        }
    }




}



