
import { graphMGR } from "../MDPApp";
export default function ComplexityGraph({ mdptype }: { mdptype: string }) { return (graphMGR.generateGraph(mdptype)) }