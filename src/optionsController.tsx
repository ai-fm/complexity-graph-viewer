import { graphMGR, optionsOpen, p, setOptionsOpen } from "./main"

export class optionsController {
    //options menu button, generated in MDPApp
    obtn: HTMLImageElement | null = null
    //options elements container
    oec: HTMLDivElement | null = null


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
        }
    }


    optionsSubmenu(type: string) {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
        if (type == "edit") {
            this.oec.appendChild(document.createElement("button"))
        }

    }



    closeOptions() {
        if (this.oec == null) { p("OptionsElementsContainer is empty!"); return }
        setOptionsOpen(false)
        this.oec.style.border = "0.5vh solid #21f3f0"
        this.optionsSubmenu("hide")
    }


}



