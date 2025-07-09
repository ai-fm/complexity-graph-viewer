
import { useState } from "preact/hooks";
import "./MDPGraphContainer.css";
import "./graph_nodes/base_gnode";
import "./graph_nodes/generate_graph";
import ComplexityGraph from "./graph_nodes/generate_graph";

//export definition for func ahead of implementing it
export let setGraphType: (pGraphtype: string) => void

export default function MDPGraphContainer() {
  //state holding current mdp 
  const [graphtype, setGraphtype] = useState('MDP');
  //define exported function to allow dropdown to pick displayed MDPs
  setGraphType = function (pGraphtype) {
    setGraphtype(pGraphtype)
  }

  return (
    <div id="graphViewContainer" style="flex-direction:row; flex-grow: 1; " >
      <ComplexityGraph mdptype={graphtype} />
    </div>
  );
}