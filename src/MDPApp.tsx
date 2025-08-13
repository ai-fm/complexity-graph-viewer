
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
            <img id="optionsButton" src="temp_options_button.png" >
            </img>
          </div>
        </div>
      </div>
    </main >
  );
}

export default MDPApp;