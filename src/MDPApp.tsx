
import "./MDPApp.css";
import MDPTypeDropdown from "./MDPTypeDropdown";
function MDPApp() {

  return (
    <main class="container">
      <div style="display: flex;">
        <div id="graphViewContainerBorder" style="flex-grow: 1; position:relative">
          <div id="graphViewContainer" style="flex-grow: 1; position:relative">
          </div>
        </div>
        <div style="display:flex; flex-direction:column" id="inputColumn">
          <div id="MDPTypeDropdownContainer">
            <MDPTypeDropdown />
          </div>
          <div id="InformationContainer">
          </div>
          <div id="optionButtonContainer" >
            <span style="font-size:75px" id="optionsButton" >⚙
            </span>
          </div>
        </div>
      </div>
    </main >
  );
}

//document.createElement("span").style.fontSize
export default MDPApp;