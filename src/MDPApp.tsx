import "./MDPApp.css";

export class MDPApp {
  renderRoot: HTMLElement
  appContainer: HTMLElement
  divContainer: HTMLElement
  gvcBorder: HTMLElement
  gvc: HTMLElement
  inputColumn: HTMLElement
  dropdownContainer: HTMLElement
  infoContainer: HTMLElement
  optionsContainer: HTMLElement

  constructor(renderRoot: HTMLElement) {
    // If there somehow is no root element, i just dont care to even fix it because that means there somehow is no page(?)

    this.renderRoot = renderRoot

    this.appContainer = document.createElement("div")
    this.appContainer.id = "appContainer"
    this.renderRoot.appendChild(this.appContainer)

    this.divContainer = document.createElement("div")
    this.divContainer.style.display = "flex"
    this.appContainer.appendChild(this.divContainer)

    this.gvcBorder = document.createElement("div")
    this.gvcBorder.style.flexGrow = "1"
    this.gvcBorder.style.position = "relative"
    this.gvcBorder.id = "graphViewContainerBorder"
    this.divContainer.appendChild(this.gvcBorder)

    this.gvc = document.createElement("div")
    this.gvc.style.flexGrow = "1"
    this.gvc.style.position = "relative"
    this.gvc.id = "graphViewContainer"
    this.gvcBorder.appendChild(this.gvc)

    this.inputColumn = document.createElement("div")
    this.inputColumn.style.display = "flex"
    this.inputColumn.style.flexDirection = "column"
    this.inputColumn.id = "inputColumn"
    this.divContainer.appendChild(this.inputColumn)

    this.dropdownContainer = document.createElement("div")
    this.dropdownContainer.id = "MDPTypeDropdownContainer"
    this.inputColumn.appendChild(this.dropdownContainer)

    this.infoContainer = document.createElement("div")
    this.infoContainer.id = "InformationContainer"
    this.inputColumn.appendChild(this.infoContainer)

    this.optionsContainer = document.createElement("div")
    this.optionsContainer.id = "optionsButtonContainer"
    this.inputColumn.appendChild(this.optionsContainer)

    const optionsButton = document.createElement("span")
    optionsButton.style.fontSize = "75px"
    optionsButton.id = "optionsButton"
    optionsButton.textContent = "⚙"
    this.inputColumn.appendChild(optionsButton)

  }

}