//mass import graph structures.
//much like with the mass result indexer, i am under the potentially false belief that this cant be done using a loop or foreach.
//i would like to be proven wrong
import mdps from "./MDPs.json";
import pomdps from "./POMDPs.json";
import template from "./Template.json";
const graphStructures = [
    mdps, pomdps, template
];

export default graphStructures;