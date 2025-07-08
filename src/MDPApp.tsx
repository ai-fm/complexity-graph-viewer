
import "./MDPApp.css";
import MDPGraphContainer from "./MDPGraphContainer";
import MDPTypeDropdown from "./MDPTypeDropdown";
import { moveGraphItem } from "./graph_nodes/base_gnode";

function MDPApp() {

  // mouse stuff based on https://www.tnado.com/blog/javascript-move-a-div-element-with-the-mouse/
  // so far just used for elements within graph but global mousedown event 

  let mousedown = false
  //offset vars for moving the graph
  let offsetX = 0;
  let offsetY = 0;
  let lastX = 0;
  let lastY = 0;
  let zoom = 1;



  //THIS MOUSE EVENT IS GLOBAL! not an issue in itself (yet?) since if statements confine it to only act within div but keep in mind if it were to somehow override other events
  onmousedown = (event) => {
    mousedown = true
    if (document.getElementById("graphViewContainer") != null) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const gvc_rect = document.getElementById("graphViewContainer")!.getBoundingClientRect();
      if ((gvc_rect.top < event.clientY) && (event.clientY < gvc_rect.bottom) && (gvc_rect.left < event.clientX) && (event.clientX < gvc_rect.right)) {
        console.log(event.clientX, event.clientY, gvc_rect.bottom, gvc_rect.top, gvc_rect.left, gvc_rect.right)
        lastX = event.clientX; lastY = event.clientY;

      }
    }
  }
  onmouseup = (event) => {
    mousedown = false
    if (document.getElementById("graphViewContainer") != null) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const gvc_rect = document.getElementById("graphViewContainer")!.getBoundingClientRect();
      if ((gvc_rect.top < event.clientY) && (event.clientY < gvc_rect.bottom) && (gvc_rect.left < event.clientX) && (event.clientX < gvc_rect.right)) {
        //console.log(event.clientX, event.clientY, gvc_rect.bottom, gvc_rect.top, gvc_rect.left, gvc_rect.right)
        mousedown = false //pointless line, debug only for style complaints

      }
    }
  }
  //same deal as before, global for now 
  onmousemove = (event) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const gvc_rect = document.getElementById("graphViewContainer")!.getBoundingClientRect();

    if ((gvc_rect.top < event.clientY) && (event.clientY < gvc_rect.bottom) && (gvc_rect.left < event.clientX) && (event.clientX < gvc_rect.right)) {
      //console.log(event.clientX, event.clientY, gvc_rect.bottom, gvc_rect.top, gvc_rect.left, gvc_rect.right)
      if (mousedown) {
        //console.log("mouse moved idk")

        const graphitems = document.getElementsByClassName("graphitem")
        offsetX -= lastX - event.clientX;
        offsetY -= lastY - event.clientY;
        lastX = event.clientX; lastY = event.clientY;
        zoom *= 1;
        for (const i of graphitems) {
          //console.log("x", offsetX, "y", offsetY)
          moveGraphItem(i, offsetX, offsetY, zoom, gvc_rect);
        }

      }

    }
  }



  return (
    <main class="container">


      <div style="display: flex;">

        <MDPGraphContainer>

        </MDPGraphContainer>
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
