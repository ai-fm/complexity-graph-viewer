
import "./MDPApp.css";
import MDPGraphContainer from "./MDPGraphContainer";
import MDPTypeDropdown from "./MDPTypeDropdown";
import { GraphManager } from "./graph_nodes/GraphManager";

//This is the graphmanager, responsible for creating new graphs from the dropdown and in a graph moving the nodes around.
//temp disclaimer a lot of that functionality is still in other places
export const graphMGR = new GraphManager();

function MDPApp() {
  let mousedown = false

  onmousedown = (event) => {
    mousedown = true
    graphMGR.handleMouseDownEvent(event)
  }

  onmouseup = () => {
    mousedown = false;

  }

  onmousemove = (event) => {
    if (mousedown) { graphMGR.handleMouseMoveEvent(event) }
  }

  return (
    <main class="container">
      <div style="display: flex;">
        <MDPGraphContainer />
        <div style="display:flex; flex-direction:column" id="inputColumn">
          <div id="MDPTypeDropdownContainer">
            <MDPTypeDropdown />
          </div>
          <div id="filterCheckboxContainer">
          </div>
          <div id="optionButtonContainer" >
            <img class="settingsicon" src="temp_options_button.png" >
            </img>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MDPApp;