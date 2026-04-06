import { Octokit } from "@octokit/core";
import { Buffer } from "buffer";

// json-object types

export type validatorCategories = Record<string, string[][]>;

//single node that appears on graph
export interface graphNode {
    posX: number;
    posY: number;
    type: string;
    title: string | null | undefined;
    id: string;
    children: graphNode[];
    childDegree?: number;
    valueType?: string
}

//single connector
export interface connector {
    idFrom: string;
    idTo: string;
    type: string
}

//entire graph structure
export interface Graph {
    graphtype: string;
    nodes: graphNode[];
    connectors?: connector[];
}

//result within paper result
export interface complexityResult {
    mdpType: string;
    problemType: string;
    problemApproach: string;
    problemNotes: string;
    complexity: string;
    complexitysuffix: string;
    horizonType: string;
    generalProofType: string;
    proofNotes: string;
    determinism: string;
    dependence: string;
    complexityNotes: string;
    special: string[]
}

//entire paper
export interface Paper {
    title:string;
    authors:string[];
    results:complexityResult[];
    url:string
}

// global variables
export let mousedown = false
export let optionsOpen = false
export let graphEditActive = false
export let currentGraphType:string
export let activeEditGraph:Graph
export let activeEditNode:graphNode|null
export let editPageCount = 0
export let editSubPageCount=0
export let graphOffsets=[0,0]
export let graphZoom=1
export function setMouseDown(value: boolean) { mousedown = value }
export function setOptionsOpen(isOpen: boolean) { optionsOpen = isOpen }
export function setGraphEdit(isOpen: boolean) { graphEditActive = isOpen; if(!isOpen){activeEditNode=null} }
export function setCurrentGraphType(type:string){currentGraphType=type}
export function setEditGraph(graph:Graph){activeEditGraph=Object.assign({}, graph)}
export function setEditNode(node:graphNode|null){activeEditNode=node}
export function setEditPC(pg:number){editPageCount=pg}
export function setEditSPC(pg:number){editSubPageCount=pg}
export function calcGraphOffsets(x: number,y: number){graphOffsets=[graphOffsets[0]+x,graphOffsets[1]+y]}
export function setGraphZoom(z:number){graphZoom=z}

export let validCategories: validatorCategories
export let graphIndices: { configs: string[]; }
export let graphConfigs: Graph[]
export let resultIndices: { results: string[]; }
export let paperResults: Paper[]

export let validatedResults:Paper[]
export let validGraphTypes:string[]

//DONT PUSH THIS
export const globalDefault = ""
// here for local rate limits. fine grained to limit potential risks if i do upload it


//INITIALIZERS


// initialize global backend variables
export async function initAll(token = globalDefault) {
    await initValidCategories(token)
    await initGraph(token)
    await initResults(token)
    validatePaperResults();
    currentGraphType=validGraphTypes[0]
    
}

// fetch json containing valid entries for certain categories from repo
export async function initValidCategories(token = globalDefault) {
    const fetched = await fetch_json(token,'ClemRub','complexity-jsons','valid_values/node-category-values.json')
    if (('content' in fetched) && (typeof fetched.content == typeof "")) {
        validCategories=JSON.parse(decode(fetched.content as string))
    }
}

// fetch index and jsons containing graph structures from repo
export async function initGraph(token = globalDefault) {
    const fetched = await fetch_json(token,'ClemRub','complexity-jsons','complexity_graph_configs/graphcfgindex.json')
    const graphCfgs = []
    if (('content' in fetched) && (typeof fetched.content == typeof "")) {
        graphIndices= JSON.parse(decode(fetched.content as string))
        for (const i of graphIndices.configs) {
            const fetched = await fetch_json(token,'ClemRub','complexity-jsons','complexity_graph_configs/' + i)
            if (('content' in fetched) && (typeof fetched.content == typeof "")) {
                graphCfgs.push(JSON.parse(decode(fetched.content as string)))
            }
        }
    }
    graphConfigs=graphCfgs
    validGraphTypes=graphConfigs.map(e => e.graphtype)
}

// fetch indices and jsons containing complexity results from repo
export async function initResults(token = globalDefault) {
    const fetched = await fetch_json(token,'ClemRub','complexity-jsons','results/resultindex.json')
    const paperRes = []
    if (('content' in fetched) && (typeof fetched.content == typeof "")) {
        resultIndices = JSON.parse(decode(fetched.content as string))
        for (const i of resultIndices.results) {
            const fetched = await fetch_json(token,'ClemRub','complexity-jsons','results/'+i)
            if (('content' in fetched) && (typeof fetched.content == typeof "")) {
                paperRes.push(JSON.parse(decode(fetched.content as string)))
            }
        }
    }
    paperResults=paperRes
}

export function validatePaperResults(){
    validatedResults=[]
    for(const i of paperResults){
    
        const candidate={} as Paper
        candidate.authors=i.authors
        candidate.title=i.title
        candidate.results=[]
        candidate.url=i.url
        for(const j of i.results){
            if(isValidResult(j)){
                candidate.results.push(j)
            }
        }
        
        if(candidate.results.length>0){validatedResults.push(candidate)}
    }
}


function isValidResult(res: complexityResult) {
    let categ:keyof typeof res
    for(categ in res){
        //only check categories included in validCategories, other categories neednt be validated or wont be acknowledged
        
        if(categ in validCategories){
            let valid=false
            for(const l of validCategories[categ as keyof typeof validCategories]){
                //"as string" because special category is string array instead of string, but shouldnt be validated anyways. Hypothetically might instead run "sub-validation" on such instances
                if(l.includes(res[categ] as string)){valid=true}
            }
            if(!valid){return false}
        }
    }
    return true;
}

//AUXILIARY AND ASSISTANCE

export function getGraphByType(type:string){
    if(type=="edit"){
        return activeEditGraph
    }
    for(const i of graphConfigs){
        if(i.graphtype==type){return i}
    }

    return {} as Graph
}


// simple debug print function
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export function p(...t: any[]) { console.log(t) }

//https://stackoverflow.com/questions/56952405/how-to-decode-encode-string-to-base64-in-typescript-express-server, adjusted
export function decode(str: string): string {
    return Buffer.from(str, 'base64').toString('utf8');
}

export function encode(str: string): string {
    return Buffer.from(str, 'utf8').toString('base64');
}

export async function getsha(token: string, owner: string, repo: string, path: string){
    const octokit = new Octokit({auth: token})
    try {
        const response=await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: owner,
            repo: repo,
            path: path})

            if ('sha' in response.data) {return response.data.sha}   
        } 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error:any){if (error.status === 404) {
      return undefined;
    }}
    
}

// appends options to empty dropdown/datalist option set 
// wording not readjusted from initial use solely as dropdown
export function addOptions(types: string[], elementOptions: HTMLElement | null) {
  const uniqueTypes = Array.from(new Set(types)); //this removes duplicates 
  uniqueTypes.map(option => {
    // generate option element from input string. adjusted from https://stackoverflow.com/a/62342334
    const optionElement = document.createElement('option');
    optionElement.textContent = option;
    optionElement.value = option;
    // simple not null-check. shouldnt be neccesary because this wouldnt be called outside of dropdownField element, but to be on the safe side.
    if (elementOptions != null) { elementOptions.appendChild(optionElement); }
    else { console.log("options target initialized as null, this should not be possible? debug") }
  });
}

//DOWNLOAD

// Download from the repository.
export async function fetch_json(token: string, owner: string, repo: string, path: string) {
    const octokit = new Octokit({
        auth: token
    })

    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: repo,
        path: path
    })

    return response.data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function download(pContent: any, fileName: string) {
        const content = JSON.stringify(pContent, null, "\t");
        const a = document.createElement("a");
        const file = new Blob([content], { type: "text/json" });;
        a.href = URL.createObjectURL(file);
        a.download = fileName += ".json";
        a.click();
}

export function getNodeFromID(id:string,nodes:graphNode[],depth=0){
    for(const n of nodes){
        if(n.id==id){return n}
    }
    for(const n of nodes){
        if(n.id==id.slice(0,depth+1)){
            return getNodeFromID(id,n.children,depth+2)
        }
    }
    return {} as graphNode
}

//UPLOAD

// Upload to the repository.
export async function upload(token = globalDefault, owner: string, repo: string, path: string, message: string, content: string) {
    const sha=await getsha(token, owner, repo, path)

    const octokit = new Octokit({
        auth: token
    })
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: repo,
        path: path,
        message: message,
        committer: {
            name: 'Complexity-graph submission',
            email: 'none@none.none'
        },
        content: content,
        sha: sha
    })
}













