
import jsons from "../configs/results/index.ts";
import { getValidCategories } from "./global.ts";
//read all nodes from indexed raw jsons and convert them into array iff valid according to category values.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateNode(rawJson: { title?: string; authors?: string[]; results: any; url?: string; }) {
  //set to defaults if not set for the values that have default values
  rawJson.results.forEach((elem: { problemType: string; rewardConstraints?: string; mdpRepresentation?: string; }) => {
    if (elem.problemType == null) { elem.problemType = "Reward Maximisation" };
    if (elem.rewardConstraints == null) { elem.rewardConstraints = "None" };
    if (elem.mdpRepresentation == null) { elem.mdpRepresentation = "Flat" };
  }
  )
  //Conjuction of all constraints on our node.
  //we presume their string/string[]ness a given here, (for now? i dont think this needs fixing. ts itself is sure enough to assume these types.)
  let validity = true;

  const flatinclude = (candidate: string, categories2D: string[][]) => {
    for (const arr of categories2D) {
      if (arr.includes(candidate)) { return true }
    }
    return false;
  }

  const validCategories = await getValidCategories()

  rawJson.results.forEach((elem: {
    mdpType: string;
    problemType: string;
    problemApproach: string;
    complexity: string;
    horizonType: string;
    determinism: string | null;
    dependence: string | null;
    policyMemory: string | null;
    analysisType: string | null;
    rewardConstraints: string;
    ambiguitySetRectangularity: string | null;
    ambiguitySetConvexness: string | null;
    mdpRepresentation: string;
    generalProofType: string;
  }) => {
    validity = validity &&
      flatinclude(elem.mdpType, validCategories.mdpType) &&
      flatinclude(elem.problemType, validCategories.problemType) &&
      flatinclude(elem.problemApproach, validCategories.problemApproach) &&
      flatinclude(elem.complexity, validCategories.complexityClass) &&
      flatinclude(elem.horizonType, validCategories.horizonType) &&
      ((elem.determinism == null) ? true : flatinclude(elem.determinism, validCategories.determinism)) &&
      ((elem.dependence == null) ? true : flatinclude(elem.dependence, validCategories.dependenceType)) &&
      ((elem.policyMemory == null) ? true : flatinclude(elem.policyMemory, validCategories.policyMemory)) &&
      ((elem.analysisType == null) ? true : flatinclude(elem.analysisType, validCategories.analysisType)) &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      flatinclude(elem.rewardConstraints!, validCategories.rewardConstraint) &&
      ((elem.ambiguitySetRectangularity == null) ? true : flatinclude(elem.ambiguitySetRectangularity, validCategories.ambiguitySetRectangularity)) &&
      ((elem.ambiguitySetConvexness == null) ? true : flatinclude(elem.ambiguitySetConvexness, validCategories.ambiguitySetConvexness)) &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      flatinclude(elem.mdpRepresentation!, validCategories.mdpRepresentation) &&
      flatinclude(elem.generalProofType, validCategories.proofType);
  });

  return (validity)

}

//only exports valid nodes. rest return false and are filtered out.
export const nodes = jsons.filter(raw => validateNode(raw));

