
import jsons from "../../complexity_result_jsons/json_directory/index.ts";
import validCategories from "../../mdp_configs/node-category-values.json";
//read all nodes from indexed raw jsons and convert them into array iff valid according to category values.

function validateNode(rawJson: { mdpType: string; title?: string; authors?: string[]; problemType: string; problemApproach: string; problemNotes?: string; complexity: string; horizonType: string; generalProofType: string; proofNotes?: string; url?: string; rewardConstraints?: string; mdpRepresentation?: string; determinism?: string; dependence?: string; policyMemory?: string; analysisType?: string; ambiguitySetRectangularity?: string; ambiguitySetConvexness?: string; }) {
  //set to defaults if not set for the values that have default values
  if (rawJson.problemType == null) { rawJson.problemType = "Reward Maximisation" };
  if (rawJson.rewardConstraints == null) { rawJson.rewardConstraints = "None" };
  if (rawJson.mdpRepresentation == null) { rawJson.mdpRepresentation = "Flat" };

  //Conjuction of all constraints on our node.
  //we presume their string/string[]ness a given here, (for now? i dont think this needs fixing. ts itself is sure enough to assume these types.)
  return (
    validCategories.mdpTypes.includes(rawJson.mdpType) &&
    //is title valid string would go here, is presumed
    //is author valid stringarr would go here, is presumed
    validCategories.problemTypes.includes(rawJson.problemType) &&
    validCategories.problemApproach.includes(rawJson.problemApproach) &&
    validCategories.complexityClasses.includes(rawJson.complexity) &&
    validCategories.horizonTypes.includes(rawJson.horizonType) &&
    //if null (else if value included)
    ((rawJson.determinism == null) ? (true) : (validCategories.determinism.includes(rawJson.determinism))) &&
    ((rawJson.dependence == null) ? (true) : (validCategories.dependenceTypes.includes(rawJson.dependence))) &&
    ((rawJson.policyMemory == null) ? (true) : (validCategories.policyMemory.includes(rawJson.policyMemory))) &&
    ((rawJson.analysisType == null) ? (true) : (validCategories.analysisTypes.includes(rawJson.analysisType))) &&
    //is discount shape string or null would go here, is presumed
    validCategories.rewardConstraints.includes(rawJson.rewardConstraints) &&
    ((rawJson.ambiguitySetRectangularity == null) ? (true) : (validCategories.ambiguitySetRectangularity.includes(rawJson.ambiguitySetRectangularity))) &&
    ((rawJson.ambiguitySetConvexness == null) ? (true) : (validCategories.ambiguitySetConvexness.includes(rawJson.ambiguitySetConvexness))) &&
    validCategories.mdpRepresentations.includes(rawJson.mdpRepresentation) &&
    validCategories.proofTypes.includes(rawJson.generalProofType)
    //validate that url is valid url
  )
}

//only exports valid nodes. rest return false and are filtered out.
export default jsons.filter(raw => validateNode(raw));

