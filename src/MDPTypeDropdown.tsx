import { useState } from "preact/hooks";
import { graphMGR } from "./main";

import "./MDPTypeDropdown.css";
import { nodes } from "./nodes/nodes";
export let dropdownval: string;
export default function MDPTypeDropdown() {
  const [, setValue] = useState('');
  const MDPTypes = nodes.map(entry => entry.results.map(elem => elem.mdpType)).flat()


  return (

    <div class="form">
      <select id="dropdownField" onChange={(e) => {
        graphMGR.updateGraphType(e.currentTarget.value);
        setValue(e.currentTarget.value)
      }}>
        {window.onload = function () { { addOptions(graphMGR.addMDPTypes(MDPTypes), document.getElementById("dropdownField")); graphMGR.graphtype = MDPTypes[0] } }}
      </select>
    </div>
  );

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
}