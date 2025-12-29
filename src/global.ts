import { GraphManager } from "./GraphManager";
import { MDPApp } from "./MDPApp";
import { optionsController } from "./optionsController";


export let mdpAPP: MDPApp
export let graphMGR: GraphManager
export let optionsCTR: optionsController

export function initialise_singletons(renderRoot: HTMLElement) {
    mdpAPP = new MDPApp(renderRoot);
    graphMGR = new GraphManager();
    optionsCTR = new optionsController();
}

// global variables
export let mousedown = false
export let optionsOpen = false
export function setMouseDown(value: boolean) { mousedown = value }
export function setOptionsOpen(isOpen: boolean) { optionsOpen = isOpen }



// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export function p(...t: any[]) { console.log(t) }