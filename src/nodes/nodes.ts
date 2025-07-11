
import jsons from "../../complexity_result_jsons/json_directory/index.ts";
import validCategories from "../../mdp_configs/node-category-values.json";
//read all nodes from indexed raw jsons and convert them into array iff valid according to category values.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateNode(rawJson: { title?: string; authors?: string[]; results: any; url?: string; }) {
  //set to defaults if not set for the values that have default values
  rawJson.results.forEach((elem: { problemType: string | null; rewardConstraints: string | null; mdpRepresentation: string | null; }) => {
    if (elem.problemType == null) { elem.problemType = "Reward Maximisation" };
    if (elem.rewardConstraints == null) { elem.rewardConstraints = "None" };
    if (elem.mdpRepresentation == null) { elem.mdpRepresentation = "Flat" };
  }
  )
  //Conjuction of all constraints on our node.
  //we presume their string/string[]ness a given here, (for now? i dont think this needs fixing. ts itself is sure enough to assume these types.)
  let validity = true;
  rawJson.results.forEach((elem: { mdpType: string; problemType: string; problemApproach: string; complexity: string; horizonType: string; determinism: string | null; dependence: string | null; policyMemory: string | null; analysisType: string | null; rewardConstraints: string; ambiguitySetRectangularity: string | null; ambiguitySetConvexness: string | null; mdpRepresentation: string; generalProofType: string; }) => {
    validity = validity &&


      validCategories.mdpTypes.includes(elem.mdpType) &&
      validCategories.problemTypes.includes(elem.problemType) &&
      validCategories.problemApproach.includes(elem.problemApproach) &&
      validCategories.complexityClasses.includes(elem.complexity) &&
      validCategories.horizonTypes.includes(elem.horizonType) &&
      ((elem.determinism == null) ? (true) : (validCategories.determinism.includes(elem.determinism))) &&
      ((elem.dependence == null) ? (true) : (validCategories.dependenceTypes.includes(elem.dependence))) &&
      ((elem.policyMemory == null) ? (true) : (validCategories.policyMemory.includes(elem.policyMemory))) &&
      ((elem.analysisType == null) ? (true) : (validCategories.analysisTypes.includes(elem.analysisType))) &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      validCategories.rewardConstraints.includes(elem.rewardConstraints!) &&
      ((elem.ambiguitySetRectangularity == null) ? (true) : (validCategories.ambiguitySetRectangularity.includes(elem.ambiguitySetRectangularity))) &&
      ((elem.ambiguitySetConvexness == null) ? (true) : (validCategories.ambiguitySetConvexness.includes(elem.ambiguitySetConvexness))) &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      validCategories.mdpRepresentations.includes(elem.mdpRepresentation!) &&
      validCategories.proofTypes.includes(elem.generalProofType)
  });

  return (validity)

}

//only exports valid nodes. rest return false and are filtered out.
export const nodes = jsons.filter(raw => validateNode(raw));

