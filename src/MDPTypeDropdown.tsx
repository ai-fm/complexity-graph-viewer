
import { p, setCurrentGraphType } from "./global";
import { GraphManager } from "./GraphManager";
import "./MDPTypeDropdown.css";

export class MDPTypeDropdown {
  dropdownForm!: HTMLElement;
  dropdownField!: HTMLElement;
  value: undefined | string


  constructor(parent: HTMLElement | null, graphMGR: GraphManager) {
    if (parent == null) { p("No parent provided for type dropdown"); return }
    this.dropdownForm = document.createElement("div")
    this.dropdownForm.className = "form"
    parent.appendChild(this.dropdownForm)

    this.dropdownField = document.createElement("select")
    this.dropdownField.id = "dropdownField"
    this.dropdownField.onchange = (e) => {
      if (e.currentTarget == null) { return }
      const target = e.currentTarget as HTMLFormElement
      setCurrentGraphType(target.value)
      graphMGR.loadGraph(target.value)
      this.value = target.value
    }
    this.dropdownForm.appendChild(this.dropdownField)
  }
}
