
import "./MDPApp.css";
import MDPTypeDropdown from "./MDPTypeDropdown";
import { GraphManager } from "./graph_nodes/GraphManager";
import GraphNode from "./graph_nodes/base_gnode";

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
        <div id="graphViewContainer" style="flex-direction:row; flex-grow: 1; " >
          <GraphNode data={[20, [0, 1]]} />
          <GraphNode data={[12, [10, 1]]} />
        </div>
        {console.log(document.getElementById("graphViewContainer"))}
        {graphMGR.loadGraphElems()}
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