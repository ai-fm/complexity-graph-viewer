//core functionality for standard dropdown form
import { useState } from "preact/hooks";
import { setGraphType } from "./MDPGraphContainer";
import "./MDPTypeDropdown.css";
import nodes from "./nodes/nodes";
//modified standard dropdown form from https://preactjs.com/guide/v10/forms
//TODO customize and adapt
//TODO use form logic instead
export let dropdownval: string;

export default function MDPTypeDropdown() {
  const [value, setValue] = useState('');
  const MDPTypes = nodes.map(entry => entry.mdpType)


  return (

    <div class="form">
      {/* id used to find form in code to append all options on loading in of the window. Options loaded from node import*/}
      <select id="selectMDP" onChange={(e) => {
        //update graph in graph viewer and value in dropdown
        setGraphType(e.currentTarget.value)
        setValue(e.currentTarget.value)
      }}>
        {window.onload = function () { { addOptions(MDPTypes, document.getElementById("selectMDP")); } }}
      </select>
      {<p>{value}</p>}
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
      // simple not null-check. shouldnt be neccesary because this wouldnt be called outside of selectMDP element, but to be on the safe side.
      if (dropdownElementOptions != null) { dropdownElementOptions.appendChild(optionElement); }
      else { console.log("dropdown initialized as null, this should not be possible? debug") }
    });
  }
}

