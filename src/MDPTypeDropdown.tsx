import { graphMGR } from "./global";
import "./MDPTypeDropdown.css";
import { nodes } from "./node_validator";

// appends options to empty dropdown option set 
function addOptions(types: string[], dropdownElementOptions: HTMLElement | null) {
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
  dropdownForm: HTMLElement
  dropdownField: HTMLElement
  value: undefined | string

  constructor(parent: HTMLElement) {
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

    window.onload = function () {
      const MDPTypes = nodes.map(entry => entry.results.map(elem => elem.mdpType)).flat()
      {
        addOptions(graphMGR.addMDPTypes(MDPTypes), document.getElementById("dropdownField")); graphMGR.graphtype = MDPTypes[0]
      }
    }
  }



}
