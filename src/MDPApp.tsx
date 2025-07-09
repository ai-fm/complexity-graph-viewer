
import "./MDPApp.css";
import MDPGraphContainer from "./MDPGraphContainer";
import MDPTypeDropdown from "./MDPTypeDropdown";
import { GraphManager } from "./graph_nodes/GraphManager";

function MDPApp() {

  // mouse stuff based on https://www.tnado.com/blog/javascript-move-a-div-element-with-the-mouse/
  // so far just used for elements within graph but global mousedown event 

  let mousedown = false

  //This is the graphmanager class, responsible for creating new graphs from the dropdown and in a graph moving the nodes around.
  //temp disclaimer a lot of that functionality is still in other places
  const graphMGR = new GraphManager();

  onmousedown = (event) => {
    mousedown = true
    graphMGR.handleMouseDownEvent(event)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onmouseup = (_event) => {
    mousedown = false;

  }
  onmousemove = (event) => {
    if (mousedown) { graphMGR.handleMouseMoveEvent(event) }
  }




  return (
    <main class="container">


      <div style="display: flex;">

        <MDPGraphContainer>

        </MDPGraphContainer>
        {graphMGR.fetchGVC()}
        <div style="display:flex; flex-direction:column" id="inputColumn">
          <div id="MDPTypeDropdownContainer">
            <MDPTypeDropdown>

            </MDPTypeDropdown>
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
