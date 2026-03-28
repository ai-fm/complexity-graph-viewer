import { Octokit } from "@octokit/core";
import { Buffer } from "buffer";


// global variables
export let mousedown = false
export let optionsOpen = false
export function setMouseDown(value: boolean) { mousedown = value }
export function setOptionsOpen(isOpen: boolean) { optionsOpen = isOpen }

//DONT PUSH THIS
export const globalDefault = ""


//https://stackoverflow.com/questions/56952405/how-to-decode-encode-string-to-base64-in-typescript-express-server, adjusted
export function decode(str: string): string {
    return Buffer.from(str, 'base64').toString('utf8');
}

export function encode(str: string): string {
    return Buffer.from(str, 'utf8').toString('base64');
}

// global backend variables

// fetch json containing valid entries for certain categories from repo
export async function getValidCategories(token = globalDefault) {
    const fetched = await new Octokit({ auth: token }).request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'ClemRub',
        repo: 'complexity-jsons',
        path: 'valid_values/node-category-values.json'
    })

    if (('content' in fetched.data) && (typeof fetched.data.content == typeof "")) {
        return JSON.parse(decode(fetched.data.content as string))
    }
}

// fetch jsons containing graph structures from repo
export async function getGraphConfigs(token = globalDefault) {
    const fetched = await new Octokit({ auth: token }).request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'ClemRub',
        repo: 'complexity-jsons',
        path: 'complexity_graph_configs/graphcfgindex.json'
    })

    const graphConfigs = []

    if (('content' in fetched.data) && (typeof fetched.data.content == typeof "")) {
        const data = JSON.parse(decode(fetched.data.content as string))
        for (const i of data.configs) {


            const fetched = await new Octokit({ auth: token }).request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: 'ClemRub',
                repo: 'complexity-jsons',
                path: 'complexity_graph_configs/' + i
            })
            if (('content' in fetched.data) && (typeof fetched.data.content == typeof "")) {
                graphConfigs.push(JSON.parse(decode(fetched.data.content as string)))
            }
        }
    }

    return graphConfigs
}

// fetch jsons containing complexity results from repo
export async function getPaperResults(token = globalDefault) {
    const fetched = await new Octokit({
        auth: token
    }).request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'ClemRub',
        repo: 'complexity-jsons',
        path: 'results/resultindex.json'
    })

    const paperResults = []

    if (('content' in fetched.data) && (typeof fetched.data.content == typeof "")) {

        const data = JSON.parse(decode(fetched.data.content as string))
        for (const i of data.results) {

            const fetched = await new Octokit({ auth: token }).request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: 'ClemRub',
                repo: 'complexity-jsons',
                path: 'results/' + i
            })
            if (('content' in fetched.data) && (typeof fetched.data.content == typeof "")) {
                paperResults.push(JSON.parse(decode(fetched.data.content as string)))
            }
        }
    }
    return paperResults
}

// simple debug print function
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export function p(...t: any[]) { console.log(t) }

