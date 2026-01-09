
import { p } from "./global";
import { GraphManager } from "./GraphManager";
import "./MDPTypeDropdown.css";

// appends options to empty dropdown option set 
export function addOptions(types: string[], dropdownElementOptions: HTMLElement | null) {
  const uniqueTypes = Array.from(new Set(types)); //this removes duplicates 
  uniqueTypes.map(option => {
    // generate option element from input string. adjusted from https://stackoverflow.com/a/62342334
    const optionElement = document.createElement('option');
    optionElement.textContent = option;
    optionElement.value = option;
    // simple not null-check. shouldnt be neccesary because this wouldnt be called outside of dropdownField element, but to be on the safe side.
    if (dropdownElementOptions != null) { dropdownElementOptions.appendChild(optionElement); }
    else { console.log("dropdown initialized as null, this should not be possible? debug") }
  });
}

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
      graphMGR.updateGraphType(target.value);
      this.value = target.value
    }


    this.dropdownForm.appendChild(this.dropdownField)
  }



}
