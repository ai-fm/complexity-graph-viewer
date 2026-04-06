import { activeEditGraph, addOptions, complexityResult, currentGraphType, download, editPageCount, editSubPageCount, encode,  getGraphByType,  getNodeFromID, Graph,   graphIndices,   graphNode,  initGraph,  initValidCategories,  optionsOpen, p, Paper, paperResults, resultIndices, setEditGraph, setEditPC, setEditSPC, setGraphEdit, setOptionsOpen, upload, validCategories, } from "./global";
import { GraphManager } from "./GraphManager";

export class optionsController {
    //options menu button, generated in MDPApp
    obtn: HTMLImageElement | null = null
    //options elements container
    oec: HTMLDivElement | null = null

    activeOptionMenuElements: HTMLElement[] = []


    graphMGR: GraphManager;


    ////
    //// Initialise options button and menu.
    ////

    constructor(graphMGR: GraphManager) {
        this.graphMGR = graphMGR
        this.oec = document.getElementById("InformationContainer") as HTMLDivElement
        this.obtn = document.getElementById("optionsButton") as HTMLImageElement

        this.obtn.onclick = () => {
            this.optionsToggleDropdown(false)
            setOptionsOpen(!optionsOpen)
            setGraphEdit(false)
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
        }
    }

    ////
    //// Option menus.
    ////

    // The "main" options menu. Leads to submenus.
    optionsMenu() {
        this.optionsToggleDropdown(false)
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
        for (const i of this.activeOptionMenuElements) { i.remove() }
        this.oec.style.textAlign = "center";
        
        this.oec.appendChild(document.createElement("br"))

        {const openEditJSONs = document.createElement("button")
        openEditJSONs.textContent = "Add new results or edit valid values of results."
        openEditJSONs.style.display = "inline"
        openEditJSONs.style.width = "90%"
        openEditJSONs.title = "Click to open related submenu."
        openEditJSONs.onclick = () => { this.optionsEditJSONs() }
        this.activeOptionMenuElements.push(openEditJSONs)
        this.oec.appendChild(openEditJSONs)}

        this.oec.appendChild(document.createElement("br"))
        this.oec.appendChild(document.createElement("br"))

        {const openCustomizeApp = document.createElement("button")
        openCustomizeApp.textContent = "Customize the app. Unimplemented."
        openCustomizeApp.style.display = "inline"
        openCustomizeApp.style.width = "90%"
        openCustomizeApp.title = "Click to open related submenu."
        openCustomizeApp.onclick = () => { this.optionsCustomizeApp() }
        this.activeOptionMenuElements.push(openCustomizeApp)
        this.oec.appendChild(openCustomizeApp)}

        this.oec.appendChild(document.createElement("br"))
        this.oec.appendChild(document.createElement("br"))

        {const openEditGraph = document.createElement("button")
        openEditGraph.textContent = "Edit the current graph or create a new one."
        openEditGraph.style.display = "inline"
        openEditGraph.style.width = "90%"
        openEditGraph.title = "Click to open related submenu."
        openEditGraph.onclick = () => { this.optionsEditGraph() }
        this.activeOptionMenuElements.push(openEditGraph)
        this.oec.appendChild(openEditGraph)}
    }
    
    // edit underlying JSONs for results and valid result data filters
    optionsEditJSONs() {
        this.optionsToggleDropdown(false)

        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }

        for (const i of this.activeOptionMenuElements) { i.remove() }

        this.oec.style.textAlign = "center";

        this.optionsToggleDropdown(false)
        
        this.oec.appendChild(document.createElement("br"))

        //necessary for uploads, not for downloads. 
        const Vtoken = document.createElement("input")
        Vtoken.placeholder = "Github access token. Not stored but not secure; better than perma uploading one. better solution TBD"
        Vtoken.style.display = "inline"
        Vtoken.style.paddingLeft = "2.5%"
        Vtoken.style.paddingRight = "2.5%"
        Vtoken.style.border = "0"
        Vtoken.type="password"
        Vtoken.style.width = "85%"
        Vtoken.title = "Github access token. Not stored but not secure; better than perma uploading one. better solution TBD"
        Vtoken.id = "A form field element should have an id or name attribute"
        Vtoken.autocomplete = "off"
        this.activeOptionMenuElements.push(Vtoken)
        this.oec.appendChild(Vtoken)
        
        this.oec.appendChild(document.createElement("br"))

        const editResultsBTN = document.createElement("button")
        editResultsBTN.textContent = "Edit the current results for the graph."
        editResultsBTN.title = "Present results edit"
        editResultsBTN.onclick = () => {
            this.fetchAndEditResults(Vtoken.value)
        }
        editResultsBTN.style.display = "inline"
        editResultsBTN.style.width = "90%"
        this.activeOptionMenuElements.push(editResultsBTN)
        this.oec.appendChild(editResultsBTN)

        
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

    }

    // submenu to edit "valid" filter categories on results
    fetchAndEditValid(token: string) {
        const owner = 'ClemRub'
        const repo = 'complexity-jsons'
        const path = 'valid_values/node-category-values.json'

        // open big editing container. candidate in-between step to check for correct initialisation
        const candidate = this.openBigJSON()
        if (candidate == undefined) { return }
        const [editWindow, prev, dlButton, plus, ulButton, next] = candidate

        // Get key-value pairs of value type and array of valid assignments from fetched json.

        const keys: string[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const values: any[] = []

        let x: keyof typeof validCategories
        for (x in validCategories) {
            keys.push(x)
            values.push(validCategories[x])
        }
            
        setEditPC(0)

        //initialise array for elements in current page
        let value_elems = new Array(values[editPageCount].length).fill([])

        //initialise windowTitle if it didnt exist before
        const windowTitle = document.createElement("span")
        windowTitle.className = "editWindow"
        windowTitle.textContent = keys[editPageCount] as string
        windowTitle.onclick = () => windowTitle.contentEditable = "true"
        editWindow.appendChild(windowTitle)
        const TitleRuler = document.createElement("hr")
        TitleRuler.className = "editWindow"
        editWindow.appendChild(TitleRuler)
        //initialise page
        makeValidValsEditor(editPageCount)

        // on prev button click, go to page before current and load it
        prev.onclick = () => {
            updateValues(editPageCount)
            setEditPC(editPageCount-1)
            if (editPageCount < 0) {setEditPC(keys.length - 1) }
            makeValidValsEditor(editPageCount)
        }

        // create new empty page
        plus.onclick=() => {
            updateValues(editPageCount)
            keys.push("new")
            values.push([])
            setEditPC(keys.length - 1)
            makeValidValsEditor(editPageCount)
        }

        // on next button click, go to page after current and load it
        next.onclick = () => {
            updateValues(editPageCount)
            setEditPC(editPageCount+1)
            if (editPageCount == keys.length) { setEditPC(0) }
            makeValidValsEditor(editPageCount)
        }

        // for current page, collect all non-placeholder content and store them in key/value pairs for that page.
        // this is so edits aren't lost between page flips 
        function updateValues(page: number) {
            const newValues = []
            for (const i in value_elems) {
                const temp = []
                for (const j of value_elems[i]) {
                    if (!((j.textContent == "new") || (j.textContent == "+")|| (j.textContent == ""))) {
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
            
        //collect data from key, value array. Combines it into json string. 
        function getContent(page: number) {
            updateValues(page)
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            if(keys.includes("new")){delete keys[keys.indexOf("new")]}
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            if(keys.includes("+")){delete keys[keys.indexOf("+")]}
            let content = "{"
            for (const i in keys) {
                if (keys[i] == keys[0]) {
                    content += "\"" + keys[i] + "\": ["
                    for (const j of values[i]) {
                        if (j == values[i][0]) {
                            content += "["
                            for (const k of j) {
                                if (k == j[0]) {content += "\"" + k + "\""}
                                else {content += ",\"" + k + "\""}
                            }
                            content += "]"
                        }
                        else {
                            content += ",["
                            for (const k of j) {
                                if (k == j[0]) {content += "\"" + k + "\""}
                                else {content += ",\"" + k + "\""}
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
                                if (k == j[0]) {content += "\"" + k + "\""}
                                else {content += ",\"" + k + "\""}
                            }
                            content += "]"
                        }
                        else {
                            content += ",["
                            for (const k of j) {
                                if (k == j[0]) {content += "\"" + k + "\""}
                                else {content += ",\"" + k + "\""}
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

        // function to generate editable menu for a given page number/key
        function makeValidValsEditor(pageCount:number) {
            windowTitle.textContent = keys[pageCount] as string
            const editWindowSubElems = document.querySelectorAll(".editWindowSub")
            editWindowSubElems.forEach(e => { e.remove() })
                
            //create array for values corresponding to current key.
            value_elems = new Array(values[pageCount].length).fill([])
                
            // for every array of valid value (and aliases) for current key, create new row of elements corresponding to that value
            for (const i in values[pageCount]) {
                const windowElem = document.createElement("div")
                windowElem.className = "editWindowSub"
                windowElem.style.display = "flex"
                windowElem.style.flexWrap = "wrap"

                const vals = []
                    
                //for every alias, create new sub-element in row
                for (const j of values[pageCount][i]) {
                    const elem = document.createElement("div")
                    elem.className = "editWindowSub"
                    elem.style.border = "0.1vh solid #21f3f0"
                    elem.style.margin = "0.1vh"
                    elem.onclick = () => elem.contentEditable = "true"
                    elem.textContent = j
                    vals.push(elem)
                    windowElem.appendChild(elem)
                }
                //set row to generated row array
                value_elems[parseInt(i)] = vals
                //in current row, add extra + element
                const elem = document.createElement("div")
                elem.className = "editWindowSub"
                elem.style.border = "0.1vh solid #21f3f0"
                elem.style.margin = "0.1vh"
                elem.textContent = "+"
                elem.onclick = () => {
                    // + element creates new element with "new" default content in front of itself
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
                // add current row to general view and add ruler after it
                editWindow.appendChild(windowElem)

                const elemRuler = document.createElement("hr")
                elemRuler.className = "editWindowSub"
                editWindow.appendChild(elemRuler)
            }
            // add extra + row to add new row of values
            const windowPlus = document.createElement("span")
            windowPlus.className = "editWindowSub"
            windowPlus.textContent = "+"
            windowPlus.style.border = "0.1vh solid #21f3f0"
            windowPlus.style.margin = "0.1vh"
            windowPlus.onclick = () => {
                // + creates new row that only contains + element which creates new elements in row
                const windowElem = document.createElement("div")
                windowElem.className = "editWindowSub"
                windowElem.style.display = "flex"
                windowElem.style.flexWrap = "wrap"


                const elem = document.createElement("div")
                elem.style.border = "0.1vh solid #21f3f0"
                elem.style.margin = "0.1vh"
                elem.className = "editWindowSub"
                elem.textContent = "+"
                const vals: HTMLElement[] = []
                elem.onclick = () => {
                    const newElem = document.createElement("div")
                    newElem.className = "editWindowSub"
                    newElem.style.border = "0.1vh solid #21f3f0"
                    newElem.onclick = () => newElem.contentEditable = "true"
                    newElem.style.margin = "0.1vh"
                    newElem.textContent = "new"
                    vals.push(newElem)
                    windowElem.insertBefore(newElem, elem)
                }
                value_elems.push(vals)
                windowElem.appendChild(elem)
                editWindow.insertBefore(windowElem, windowPlus)

                const elemRuler = document.createElement("hr")
                elemRuler.className = "editWindowSub"
                editWindow.insertBefore(elemRuler, windowPlus)

                }
            editWindow.appendChild(windowPlus)
        }

        // download all current data 
        dlButton.onclick = () => {
            updateValues(editPageCount)
            download(getContent(editPageCount),"node-category-values")
        }
    
        // upload all current data
        ulButton.onclick = async () => {
            updateValues(editPageCount)
            const obj = getContent(editPageCount)
            const encoded = encode(JSON.stringify(obj, null, 2))
            upload(token, owner, repo, path, "Uploading new Category Jsons.", encoded)
            initValidCategories(token) //re-initialise categories to new values now
        }
    }

     // Unimplemented- Edit Color values and the like. 
    optionsCustomizeApp() {
        this.optionsToggleDropdown(false)
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }

        for (const i of this.activeOptionMenuElements) { i.remove() }

        this.oec.style.textAlign = "center";

        this.optionsToggleDropdown(false)
        
        this.oec.appendChild(document.createElement("br"))

    }

    // submenu to edit results
    fetchAndEditResults(token: string) {
        const owner = 'ClemRub'
        const repo = 'complexity-jsons'
        const path = ""//'valid_values/node-category-values.json'
        
        if(!owner){p("todo",token,repo,path)}
            
        // open big editing container. candidate in-between step to check for correct initialisation
        const candidate = this.openBigJSON()
        if (candidate == undefined) { return }
        const [editWindow, prev, dlButton, plus, ulButton, next] = candidate
        
        setEditPC(0)

        //initialise page
        const [wname, title, authors, resultContainer, url] = initPaperEditor()
        makePaperEditor()

        // on prev button click, go to page before current and load it
        prev.onclick = () => {
            updateValues()
            setEditPC(editPageCount-1)
            if (editPageCount < 0) { setEditPC(paperResults.length - 1) }
            makePaperEditor()
        }

        // create new empty page
        plus.onclick=() => {
            updateValues()
            const newPaper:Paper={
                title: "",
                authors: [],
                results: [],
                url: ""
            }
            paperResults.push(newPaper)
            setEditPC(paperResults.length - 1)
            makePaperEditor()
        }

        // on next button click, go to page after current and load it
        next.onclick = () => {
            updateValues()
            setEditPC(editPageCount+1)
            if (editPageCount == paperResults.length) { setEditPC(0) }
            makePaperEditor()
        }

        // for current page, collect all non-placeholder content and store it in active paperResults object
        // this is so edits aren't lost between page flips 
        function updateValues() {
            paperResults[editPageCount].title=title.textContent
            const authArr=[]
            for(const i of authors.children){
                if (!((i.textContent == "new") || (i.textContent == "+")|| (i.textContent == ""))) {
                    authArr.push(i.textContent)
                }
            }
            paperResults[editPageCount].authors=authArr
            
            const resultArr:complexityResult[]=[]

            paperResults[editPageCount].results=resultArr
            
            paperResults[editPageCount].results=resultArr
            paperResults[editPageCount].url=url.textContent
        }

        
        
        // function to generate editable menu for a given page number/key
        function initPaperEditor() {
            //initialise windowName if it didnt exist before
            const windowName = document.createElement("span")
            windowName.className = "editWindow"
            windowName.onclick = () => windowName.contentEditable = "true"
            editWindow.appendChild(windowName)
            const NameRuler = document.createElement("hr")
            NameRuler.className = "editWindow"
            editWindow.appendChild(NameRuler)

            //initialise windowTitle if it didnt exist before
            const windowTitle = document.createElement("span")
            windowTitle.className = "editWindow"
            windowTitle.onclick = () => windowTitle.contentEditable = "true"
            editWindow.appendChild(windowTitle)
            const TitleRuler = document.createElement("hr")
            TitleRuler.className = "editWindow"
            editWindow.appendChild(TitleRuler)

            //initialise authors
            const windowAuthors = document.createElement("div")
            windowAuthors.className = "editWindow"
            windowAuthors.style.display = "flex"
            windowAuthors.style.flexWrap = "wrap"
            // add current row to general view and add ruler after it
            editWindow.appendChild(windowAuthors)

            const elemRuler = document.createElement("hr")
            elemRuler.className = "editWindowSub"
            editWindow.appendChild(elemRuler)
 
            const resultContainer=document.createElement("div")
            resultContainer.style.margin="0.5vh"
            editWindow.appendChild(resultContainer)

            const resultsRuler = document.createElement("hr")
            resultsRuler.className = "editWindow"
            editWindow.appendChild(resultsRuler)
            const windowUrl = document.createElement("span")
            windowUrl.className = "editWindow"
            windowUrl.onclick = () => windowUrl.contentEditable = "true"
            editWindow.appendChild(windowUrl)
            return [windowName,windowTitle,windowAuthors,resultContainer, windowUrl]
        }

        
        
        // function to generate editable menu for a given page number/key
        function makePaperEditor(){
                
            wname.textContent = resultIndices.results[editPageCount]
            title.textContent = paperResults[editPageCount].title 
                
            //remove old children if existing
            for (const i of authors.children){i.remove()}
            //for every author, create new sub-element in row
            for(const i of paperResults[editPageCount].authors){
                    const elem = document.createElement("div")
                    elem.className = "editWindow"
                    elem.style.border = "0.1vh solid #21f3f0"
                    elem.style.margin = "0.1vh"
                    elem.onclick = () => elem.contentEditable = "true"
                    elem.textContent = i
                    authors.appendChild(elem)
                }
            //in current row, add extra + element
            const elem = document.createElement("div")
            elem.className = "editWindowSub"
            elem.style.border = "0.1vh solid #21f3f0"
            elem.style.margin = "0.1vh"
            elem.textContent = "+"
            elem.onclick = () => {
                // + element creates new element with "new" default content in front of itself
                const newElem = document.createElement("div")
                newElem.className = "editWindowSub"
                newElem.style.border = "0.1vh solid"
                newElem.onclick = () => newElem.contentEditable = "true"
                newElem.style.margin = "0.1vh"
                newElem.textContent = "new"
                authors.insertBefore(newElem, elem)
            }
            authors.appendChild(elem)

            
            setEditSPC(0)
            makeResultsEditor(resultContainer as HTMLDivElement) 

            url.textContent = paperResults[editPageCount].url as string
                
        }
        
        // DOESNT WORK CORRECTLY AS OF NOW
        function makeResultsEditor(resultContainer: HTMLDivElement){

            resultContainer.innerHTML=""

            const resCont=document.createElement("div")
            resCont.style.height="100%"
            resCont.style.width="100%"
            resCont.style.border="0.25vh solid #21f3f0"
            resCont.style.paddingLeft="0.1vh"
            resCont.style.paddingRight="0.1vh"
            resultContainer.appendChild(resCont)


            //rough 
            const currentResult=paperResults[editPageCount].results[editSubPageCount]
            let x: keyof complexityResult
            for (x in currentResult) {
                p(x,currentResult,paperResults)
                const contain=document.createElement("div")
                contain.style.display = "flex"
                contain.style.flexWrap = "wrap"
                contain.style.marginTop="0.1vh"
                contain.style.marginBottom="0.1vh"
                if(Array.isArray(currentResult[x])){
                    const categoryTitle=document.createElement("p")
                    categoryTitle.textContent=x+":  "
                    categoryTitle.style.margin="0"
                    contain.appendChild(categoryTitle)
                    for(const i of currentResult[x]){
                        const categoryValue=document.createElement("p")
                        categoryValue.textContent=i as string
                        categoryValue.onclick= () => categoryValue.contentEditable = "true"
                        categoryValue.oninput =() => {updateValues()}
                        categoryValue.style.border = "0.1vh solid #21f3f0"
                        categoryValue.style.margin="0"
                        categoryValue.style.marginLeft = "0.1vh"
                        contain.appendChild(categoryValue)
                    }
                }
                else if(x=="complexity"){
                    const categoryTitle=document.createElement("p")
                    categoryTitle.textContent=x+":  "
                    categoryTitle.style.margin="0"
                    contain.appendChild(categoryTitle)
                        
                    const categoryValue=document.createElement("p")
                    categoryValue.textContent=currentResult[x] as string
                    categoryValue.onclick= () => categoryValue.contentEditable = "true"
                    categoryValue.oninput =() => {updateValues()}
                    categoryValue.style.border = "0.1vh solid #21f3f0"
                    categoryValue.style.margin="0"
                    categoryValue.style.marginLeft = "0.1vh"
                    contain.appendChild(categoryValue)

                    
                    const categorySeparator=document.createElement("p")
                    categorySeparator.textContent=" - "
                    categorySeparator.style.margin="0"
                    contain.appendChild(categorySeparator)
                        
                    const categoryValueSuffix=document.createElement("p")
                    categoryValueSuffix.textContent=currentResult.complexitysuffix as string
                    categoryValueSuffix.onclick= () => categoryValueSuffix.contentEditable = "true"
                    categoryValueSuffix.oninput =() => {updateValues()}
                    categoryValueSuffix.style.border = "0.1vh solid #21f3f0"
                    categoryValueSuffix.style.margin="0"
                    categoryValueSuffix.style.marginLeft = "0.1vh"
                    contain.appendChild(categoryValueSuffix)

                }
                else if(x=="complexitysuffix"){;} //dont do anything 
                else{
                    const categoryTitle=document.createElement("p")
                    categoryTitle.textContent=x+":  "
                    categoryTitle.style.margin="0"
                    contain.appendChild(categoryTitle)
                        
                    const categoryValue=document.createElement("p")
                    categoryValue.textContent=currentResult[x] as string
                    categoryValue.onclick= () => categoryValue.contentEditable = "true"
                    categoryValue.oninput =() => {updateValues()}
                    categoryValue.style.border = "0.1vh solid #21f3f0"
                    categoryValue.style.margin="0"
                    categoryValue.style.marginLeft = "0.1vh"
                    contain.appendChild(categoryValue)

                }
                resCont.appendChild(contain)
            }


            const rButtonContainer = document.createElement("div")
            rButtonContainer.id = "resultbtnContainer"
            rButtonContainer.style.minWidth="100%"
            rButtonContainer.style.display = "flex"
            rButtonContainer.style.justifyContent = "space-around"
            rButtonContainer.style.alignItems = "center"
            resultContainer.appendChild(rButtonContainer)

            const resPrev=document.createElement("button")
            resPrev.textContent="<"
            resPrev.style.scale = "200%"
            resPrev.style.margin="0.5vh"
            resPrev.style.marginTop="1.5vh"
            resPrev.onclick=()=> {
                updateValues()
                setEditSPC(editSubPageCount-1)
                if (editSubPageCount < 0) { setEditSPC(paperResults[editPageCount].results.length - 1) }
                makeResultsEditor(resultContainer)
            }
            rButtonContainer.appendChild(resPrev)
            
            
        
            const resPlus=document.createElement("button")
            resPlus.textContent="+"
            resPlus.style.scale = "200%"
            resPlus.style.margin="0.5vh"
            resPlus.style.marginTop="1.5vh"
            resPlus.onclick=()=> {
                updateValues()
                const newResult:complexityResult={
                    mdpType: "",
                    problemType: "",
                    problemApproach: "",
                    problemNotes: "",
                    complexity: "",
                    complexitysuffix: "",
                    horizonType: "",
                    generalProofType: "",
                    proofNotes: "",
                    determinism: "",
                    dependence: "",
                    complexityNotes: "",
                    special: []
                }
                paperResults[editPageCount].results.push(newResult)
                setEditSPC(paperResults[editPageCount].results.length - 1)
                makeResultsEditor(resultContainer)
            }
            rButtonContainer.appendChild(resPlus)

            
            const resDupe=document.createElement("button")
            resDupe.textContent="⎘"
            resDupe.style.scale = "200%"
            resDupe.style.margin="0.5vh"
            resDupe.style.marginTop="1.5vh"
            resDupe.onclick=()=> {
                updateValues()
                const newResult:complexityResult=Object.assign({},paperResults[editPageCount].results[editSubPageCount])
                paperResults[editPageCount].results.push(newResult)
                setEditSPC(paperResults[editPageCount].results.length - 1)
                makeResultsEditor(resultContainer)
            }
            rButtonContainer.appendChild(resDupe)

            const resNext=document.createElement("button")
            resNext.style.scale = "200%"
            resNext.textContent=">"
            resNext.style.margin="0.5vh"
            resNext.style.marginTop="1.5vh"
            resNext.onclick=()=> {
                updateValues()
                setEditSPC(editSubPageCount+1)
                if (editSubPageCount == paperResults[editPageCount].results.length) { setEditSPC(0) }
                makeResultsEditor(resultContainer)
            }
            rButtonContainer.appendChild(resNext)
        

        }
        
        // download all current data 
        dlButton.onclick = () => {
                updateValues()
                //let content = JSON.stringify(getContent(this.editPageCount))
                const a = document.createElement("a");
                //const file = new Blob([content], { type: "text/json" });;
                //a.href = URL.createObjectURL(file);
                a.download = "node-category-values.json";
                a.click();

        }

        // upload all current data
        ulButton.onclick = async () => {/*
                updateValues(this.editPageCount)
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
                }*/
            }
            
    }

    // Edit the currently open graph 
    optionsEditGraph() {
        setGraphEdit(true)
        const graphTitleContainer=this.optionsToggleDropdown(true)
        if(graphTitleContainer==null){return}

        //initialise to last opened graph
        setEditGraph(getGraphByType(currentGraphType) as Graph)
        graphTitleContainer.value=activeEditGraph.graphtype
        this.graphMGR.loadGraph("edit")

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
        clearCanvasBTN.onclick = () => this.clearCanvas()
        this.activeOptionMenuElements.push(clearCanvasBTN)
        this.oec.appendChild(clearCanvasBTN)

        
        this.oec.appendChild(document.createElement("br"))
        this.oec.appendChild(document.createElement("br"))

        const createNewNode = document.createElement("button")
        createNewNode.textContent = "Create new node"
        createNewNode.style.display = "inline"
        createNewNode.style.width = "90%"
        createNewNode.title = "Click to create a node. Click that node again to name it."
        createNewNode.onclick = () => { this.makeGhostNode() }
        this.activeOptionMenuElements.push(createNewNode)
        this.oec.appendChild(createNewNode)

        this.oec.appendChild(document.createElement("br"))
        this.oec.appendChild(document.createElement("br"))

        const createChildNode = document.createElement("button")
        createChildNode.textContent = "Create child node"
        createChildNode.style.display = "inline"
        createChildNode.style.width = "90%"
        createNewNode.title = "Click to activate. While active, click a parent node to link it to, then a second place at which it will automatically generate linked to it."
        createChildNode.onclick = () => this.createChildElement(createChildNode.style)
        this.activeOptionMenuElements.push(createChildNode)
        this.oec.appendChild(createChildNode)
        
        this.oec.appendChild(document.createElement("br"))
        this.oec.appendChild(document.createElement("br"))

        const delNode = document.createElement("button")
        delNode.textContent = "Delete node"
        delNode.style.display = "inline"
        delNode.style.width = "90%"
        delNode.title = "Click this, and then click a node, in order to delete that node."
        delNode.onclick = () => this.deleteGraphNode(delNode.style)
        this.activeOptionMenuElements.push(delNode)
        this.oec.appendChild(delNode)

        this.oec.appendChild(document.createElement("br"))
        this.oec.appendChild(document.createElement("br"))

        const createNewConn = document.createElement("button")
        createNewConn.textContent = "Create new connector"
        createNewConn.style.display = "inline"
        createNewConn.style.width = "90%"
        createNewConn.title = "Click two nodes to create or delete a connection between them."
        createNewConn.onclick = () => this.createNewConnector(createNewConn.style)
        this.activeOptionMenuElements.push(createNewConn)
        this.oec.appendChild(createNewConn)

        this.oec.appendChild(document.createElement("br"))
        this.oec.appendChild(document.createElement("br"))

        const undoChanges = document.createElement("button")
        undoChanges.textContent = "Undo changes"
        undoChanges.style.display = "inline"
        undoChanges.style.width = "90%"
        undoChanges.title = "Undo changes in current graph"
        undoChanges.onclick = () => this.undoChanges()
        this.activeOptionMenuElements.push(undoChanges)
        this.oec.appendChild(undoChanges)

        this.oec.appendChild(document.createElement("br"))

        const downloadName = document.createElement("input")
        downloadName.placeholder = "Name the resulting json file."
        downloadName.type="text"
        downloadName.setAttribute("list","graphConfigIndices")
        downloadName.style.display = "inline"
        downloadName.style.paddingLeft = "2.5%"
        downloadName.style.paddingRight = "2.5%"
        downloadName.style.border = "0"
        downloadName.style.width = "85%"
        downloadName.autocomplete="off"
        downloadName.title = "This name is used for the file you download. If left blank, uses element name instead."
        downloadName.id = "A form field element should have an id or name attribute"
        this.activeOptionMenuElements.push(downloadName)
        this.oec.appendChild(downloadName)

        /*<!--
        Datalist approach taken from
        Source - https://stackoverflow.com/a/21958246
        Posted by Dmitry, modified by community. See post 'Timeline' for change history
        Retrieved 2026-04-04, License - CC BY-SA 4.0
        -->*/
        const gcDatalist=document.createElement("datalist")
        gcDatalist.id="graphConfigIndices"
        addOptions(graphIndices.configs,gcDatalist)
        this.oec.appendChild(gcDatalist)
    
        this.oec.appendChild(document.createElement("br"))

        const downloadBTN = document.createElement("button")
        downloadBTN.textContent = "Download Graph"
        downloadBTN.title = "Press here to download the graph as a json."
        downloadBTN.onclick = () => this.downloadCurrentOpenGraph(downloadName.value)
        downloadBTN.style.display = "inline"
        downloadBTN.style.width = "90%"
        this.activeOptionMenuElements.push(downloadBTN)
        this.oec.appendChild(downloadBTN)
        
        this.oec.appendChild(document.createElement("br"))

        //necessary for uploads, not for downloads. 
        const Vtoken = document.createElement("input")
        Vtoken.placeholder = "Github access token. Not stored but not secure; better than perma uploading one. better solution TBD"
        Vtoken.style.display = "inline"
        Vtoken.style.paddingLeft = "2.5%"
        Vtoken.style.paddingRight = "2.5%"
        Vtoken.style.border = "0"
        Vtoken.style.width = "85%"
        Vtoken.type="password"
        Vtoken.title = "Github access token. Not stored but not secure; better than perma uploading one. better solution TBD"
        Vtoken.id = "token"
        Vtoken.autocomplete = "off"
        this.activeOptionMenuElements.push(Vtoken)
        this.oec.appendChild(Vtoken)

        this.oec.appendChild(document.createElement("br"))

        const uploadBTN = document.createElement("button")
        uploadBTN.textContent = "Upload Graph"
        uploadBTN.title = "Press here to upload the graph as a json."
        uploadBTN.onclick = () => this.uploadCurrentOpenGraph(downloadName.value)
        uploadBTN.style.display = "inline"
        uploadBTN.style.width = "90%"
        this.activeOptionMenuElements.push(uploadBTN)
        this.oec.appendChild(uploadBTN)
    }

    ////
    //// Graph-editing functions
    ////

    // Undo changes to current graph by reloading everything from scratch.
    undoChanges() {
        initGraph(); 
        setEditGraph(getGraphByType(currentGraphType) as Graph);
        (document.getElementById("GraphTitleContainer") as HTMLInputElement).value = activeEditGraph.graphtype 
        this.graphMGR.loadGraph("edit")
    }

    // Remove everything in the current edit of the graph, as to start fresh
    clearCanvas(){ 
        activeEditGraph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
        activeEditGraph.nodes=[]
        activeEditGraph.connectors=[]
        this.graphMGR.loadGraph("edit")
    }

    // make hovering node for new node button 
    makeGhostNode() {
        activeEditGraph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
    
        const node = {} as graphNode
        node.posX=0
        node.posY=0
        node.type = "ClickableGraphNode"
        node.title = "<>"
        node.id = this.fetchNextFreeID(1);
        node.children = []
        node.childDegree = 0
        activeEditGraph.nodes.push(node)
        
        this.graphMGR.loadGraph("edit")
        document.getElementById(node.id)?.dispatchEvent(new MouseEvent('dblclick'))
    }

    // Create or remove connecting lines between nodes. Visual only, as of now.
    createNewConnector(btnstyle: CSSStyleDeclaration){
        activeEditGraph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
        btnstyle.color = "#0000ffff"
        btnstyle.borderColor = "#0000ffff"

        let from: string | null = null
        let to: string | null = null
        const type = "line"

       for (const i of this.graphMGR.graphitems) {
            i.onclick = (event) => {
                    event.stopPropagation()
                    // store "from" id and change button color to highlight next step
                    if (from == null) {
                        btnstyle.color = "#00ff00ff"
                        btnstyle.borderColor = "#00ff00ff"
                        from = i.id;
                    }
                    // change button color and reset on click behaviour for every affected button, edit connections
                    else {
                        to = i.id;
                        btnstyle.color = "#000000ff"
                        btnstyle.borderColor = ""
                        activeEditGraph.connectors ??= []
                        let inConnections = false;
                        let conn
                        // get connection if it exists
                        for (const i of activeEditGraph.connectors) {
                            if (i.idFrom == from && i.idTo == to){ 
                                inConnections = true; conn = i 
                            }
                        }
                        conn ??= { idFrom: from, idTo: to, type }
                        //if connection exists, delete it, else add it.
                        if (inConnections) {
                            activeEditGraph.connectors.splice(activeEditGraph.connectors.indexOf(conn), 1)
                        }
                        else {
                            activeEditGraph.connectors.push(conn)
                        }
                        this.graphMGR.loadGraph("edit")
                    }
            }
        }

    }

    // Create child element. Button behaviour.
    createChildElement(btnstyle: CSSStyleDeclaration){
        activeEditGraph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
        btnstyle.color = "#0000ffff"
        btnstyle.borderColor = "#0000ffff"
        
        for (const i of this.graphMGR.graphitems) {
            i.onclick = (event) => {
                event.stopPropagation()
                btnstyle.color = "#000000ff"
                btnstyle.borderColor = ""
                this.makeGhostChildNode(i);
            }
        }
    }

    // Create hovering child node. Later, when node is actually placed, creates connector from parent to child automatically.
    makeGhostChildNode(parent: HTMLElement) {
        activeEditGraph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
        
        const node = {} as graphNode
        node.type = "ClickableSubNode"
        node.title = "<>"
        node.id = this.fetchNextFreeID(1, parent.id + ".", [...parent.children])
        node.children = []
        node.posX = 0;
        node.posY = 20;
        this.graphMGR.createNode(node, parent);
        this.graphMGR.graphitemdata.push(node);

        for (const i of activeEditGraph.nodes) {
            if (i.id == parent.id) {
                i.children ??= []
                let deg = i.childDegree; deg ??= 0
                node.childDegree = deg + 1
                const elem = document.getElementById(node.id)
                p(elem, node.childDegree)
                if (elem != null) { elem.style.transform = "scale(" + ((node.childDegree > 0) ? 0.75 : 1) + ")" }

                i.children.push(node)

                //automatically create parent to child connection
                p(activeEditGraph.connectors)
                const conn = { idFrom: parent.id, idTo: node.id, type:"line" }
                activeEditGraph.connectors??=[]
                activeEditGraph.connectors.push(conn)
                p(activeEditGraph.connectors)
            }
        }

        this.graphMGR.loadGraph("edit")
        document.getElementById(node.id)?.dispatchEvent(new MouseEvent('dblclick'))
    }

    // remove node from activeeditgraph
    deleteGraphNode(btnstyle: CSSStyleDeclaration){
        activeEditGraph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
        btnstyle.color = "#0000ffff"
        btnstyle.borderColor = "#0000ffff"

        for (const i of this.graphMGR.graphitems) {
            i.onclick = () => {
                btnstyle.color = "#000000ff"
                btnstyle.borderColor = ""
                function removeFromID(id:string,nodes:graphNode[],depth=0){
                        for(const n of nodes){
                            if(n.id==id){
                                return nodes.filter(e => e!=getNodeFromID(id,nodes))
                            }
                        }
                        for(const n of nodes){
                            if(n.id==id.slice(0,depth+1)){
                                n.children = removeFromID(id,n.children,depth+2)
                            }
                        }
                        return nodes
                }
                activeEditGraph.nodes=removeFromID(i.id,activeEditGraph.nodes)
                this.graphMGR.loadGraph("edit")
            }
        }
        
    }

    // Change position of ghost element
    handleGhostMovement(node: graphNode, event: MouseEvent) {
        function fetchOffsets(id:string):[number,number]{
            if(id.length==1){return [0,0]}
            const [oX,oY]=fetchOffsets(id.slice(0,id.length-2))
            const parent=getNodeFromID(id.slice(0,id.length-2),activeEditGraph.nodes)
            return [parent.posX+oX,parent.posY+oY]
        }

        const [offX,offY]=fetchOffsets(node.id)
        
        node.posX=event.x-offX
        node.posY=event.y-offY
        this.graphMGR.loadGraph("edit")
    }


    //// 
    //// Settings-management and auxiliary functions
    ////

    // Disable usual dropdown functionality, replace it with editable box.
    optionsToggleDropdown(disable:boolean){
        const dropdown = document.getElementById("dropdownField") as HTMLSelectElement
            dropdown.disabled = disable; dropdown.hidden = disable
            const tdc = document.getElementById("MDPTypeDropdownContainer")
            if (disable) {
                const graphtitle = document.createElement("input")
                graphtitle.type = "text"
                graphtitle.contentEditable = "true";
                graphtitle.placeholder = "Enter graph title here.";
                graphtitle.value = "";
                graphtitle.id = "GraphTitleContainer"
                if (tdc != null) { tdc.appendChild(graphtitle) }
                return graphtitle
            } else {
                if (tdc != null) {
                    const gtc = document.getElementById("GraphTitleContainer")
                    if (gtc == null) { return }
                    tdc.removeChild(gtc)
                }

            }
    }

    // Close options menu and re-enable normal graph features
    closeOptions() {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
        setOptionsOpen(false)
        this.oec.style.border = "0.5vh solid #21f3f0"
        this.optionsToggleDropdown(false)
        this.graphMGR.loadGraph(currentGraphType)
    }

    //fetch next free id in graphitems
    fetchNextFreeID(maxid: number, prefix = "", sibs?: Element[]): string {
        let taken = false;
        let siblings = sibs;
        siblings ??= this.graphMGR.graphitems

        siblings.forEach((el: { id: string }) => {
            if (el.id.includes("SP")) { return }
            if (el.id == (prefix + maxid)) { taken = true }
        });
        if (taken == false) {
            return (prefix + maxid)
        }
        else {
            return this.fetchNextFreeID(maxid + 1, prefix, siblings)
        }
    }

    // Assign every node its appropriate value type based on the title if it doesnt have any assigned title. 
    revalidateNodeValueType(nodes:graphNode[]){
        for(const i of nodes){
            i.valueType=this.graphMGR.getValueTypeFromTitle(i.title)
            if(i.children.length>0){this.revalidateNodeValueType(i.children)}
        }
    }


    ////
    //// General big editing window functionality
    ////


    // Open a large menu view and return the button elements to navigate it. Intended to be used to edit variety of underlying data hence itself merely container.
    openBigJSON() {
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
            btn.onclick = () => { this.closeBigJSON() }
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
        let plus = document.getElementById("newPage");
        if (plus == null) {
            plus = document.createElement("button");
            plus.id = "newPage";
            plus.textContent = "+";
            plus.style.scale = "300%";
            buttonContainer.appendChild(plus);
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

        return [editWindow, prev, dlButton, plus, ulButton, next]
    }

    // hide fullscreen json editor and remove all related elements 
    closeBigJSON() {
        const editWindowElems = document.querySelectorAll(".editWindow")
        editWindowElems.forEach(e => { e.remove() })
        const editWindowSubElems = document.querySelectorAll(".editWindowSub")
        editWindowSubElems.forEach(e => { e.remove() })
        const frame = document.getElementById("fullscreenView")
        if (frame == null) { return }
        frame.style.visibility = "hidden"
    }

    ////
    //// Download and upload functionality
    ////

    // For an array of nodes, create respective jsonstring. 
    recursiveNodesToJson(nodes: graphNode[]){
        let content=""
        for(const i of nodes){
            content+="{"
			content+="\"posX\": "+i.posX+","
			content+="\"posY\": "+i.posY+","
			content+="\"type\": \""+i.type+"\","
			content+="\"title\": \""+i.title+"\","
			content+="\"id\": \""+i.id+"\","
			content+="\"children\": ["+this.recursiveNodesToJson(i.children)+"],"
			content+="\"childDegree\": "+i.childDegree+","
			content+="\"valueType\": \""+i.valueType+"\""
		    content+="},"
        }
        content=content.substring(0,content.length-1)//remove last comma
        return content
    }

    // For graph, create respective jsonstring
    getGraphAsJson(graph: Graph ){
        let content = "{"
        content+="\"graphtype\":\""+graph.graphtype+"\","
        
        content+="\"nodes\":["
        content+=this.recursiveNodesToJson(graph.nodes)
        content+="],"

        content+="\"connectors\":["
        graph.connectors??=[]
        for(const i of graph.connectors){
            content+="{"
            content+="\"idFrom\": \""+i.idFrom+"\","
			content+="\"idTo\": \""+i.idTo+"\","
			content+="\"type\": \""+i.type+"\""
		    content+="},"
        }
        if(graph.connectors.length!=0){content=content.substring(0,content.length-1)}//remove last comma

        content+="]"

        content+="}"
        return JSON.parse(content)
    }

    // Download actively edited graph under name param filename.
    downloadCurrentOpenGraph(name:string){
        this.revalidateNodeValueType(activeEditGraph.nodes)
        const graph=this.getGraphAsJson(activeEditGraph)
        graph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
        download(graph,name)
        
    }

    // Upload actively edited graph under name param filename
    uploadCurrentOpenGraph(name:string) {
        const owner = 'ClemRub'
        const repo = 'complexity-jsons'
        const path = 'complexity_graph_configs/'+name
        const token=(document.getElementById("token") as HTMLInputElement).value as string
        const addIndex = async function (){if(!graphIndices.configs.includes(name)){
            const nograph=graphIndices.configs.pop()
            graphIndices.configs.push(name)
            if(nograph!=undefined){graphIndices.configs.push(nograph)}
            const indices = encode(JSON.stringify(graphIndices, null, 2))
            await upload(token, owner, repo, 'complexity_graph_configs/graphcfgindex.json', "Uploading new Category Jsons.", indices)
        
        }}
        addIndex().then( () => {
            this.revalidateNodeValueType(activeEditGraph.nodes)
            activeEditGraph.graphtype=(document.getElementById("GraphTitleContainer") as HTMLInputElement).value as string
            const encoded = encode(JSON.stringify(activeEditGraph, null, 2))
            upload(token, owner, repo, path, "Uploading new Category Jsons.", encoded)
            initGraph(token)
        })
    }

}


