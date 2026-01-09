import { Octokit } from "@octokit/core";
import { Buffer } from "buffer";


// global variables
export let mousedown = false
export let optionsOpen = false
export function setMouseDown(value: boolean) { mousedown = value }
export function setOptionsOpen(isOpen: boolean) { optionsOpen = isOpen }

//https://stackoverflow.com/questions/56952405/how-to-decode-encode-string-to-base64-in-typescript-express-server, adjusted
export function decode(str: string): string {
    return Buffer.from(str, 'base64').toString('utf8');
}

export function encode(str: string): string {
    return Buffer.from(str, 'utf8').toString('base64');
}

// global backend variables

// allowing any for simplicity
export async function getValidCategories() {
    const fetched = await new Octokit({}).request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'ClemRub',
        repo: 'complexity-jsons',
        path: 'valid_values/node-category-values.json'
    })

    if (('content' in fetched.data) && (typeof fetched.data.content == typeof "")) {
        return JSON.parse(decode(fetched.data.content as string))
    }
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export function p(...t: any[]) { console.log(t) }

