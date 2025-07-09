
import { graphMGR } from "../MDPApp";
import "./generate_graph.css";
export default function ComplexityGraph({ mdptype }: { mdptype: string }) {


    return (
        graphMGR.generateGraph(mdptype)
    )






}

