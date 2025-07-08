
import GraphNode from "./base_gnode";
import "./generate_graph.css";
export default function ComplexityGraph({ mdptype }: { mdptype: string }) {


    if (mdptype == "MDP") {
        return (
            <div>
                <GraphNode data={[20, [0, 1]]} />
                <GraphNode data={[12, [10, 1]]} />
            </div>
        )


    }



}

