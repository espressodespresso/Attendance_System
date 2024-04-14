import fpPromise from "../index";
import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";

const requestService = new RequestService();

export async function verifyStatus(username: string, password: string, fingerprint: string) {
    const body = JSON.stringify({ "username": username, "password": password, "fingerprint": fingerprint });
    return await requestService.handleFetch(Fetch.POST, Route.login, "", Accept.JSON, body)
}

export async function getPayloadData() {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.account, "", Accept.JSON);
    if(data["status"] === 401) {
        await getNewAuthToken();
    }

    return data;
}


export async function verifyUserExists(username: string) {
    const body = JSON.stringify({ "username": username });
    const data: object = await requestService.handleFetch(Fetch.GET, Route.account, `/verify/${username}`, Accept.JSON, body);
    return data["json"]["valid"];
}

async function getNewAuthToken() {
    let body = JSON.stringify({ "fingerprint": await getBrowserFingerprint() });
    const data: object = await requestService.handleFetch(Fetch.POST, Route.account, `/auth`, Accept.JSON, body);
    switch (data["status"]) {
        case 200:
            console.log("new auth token!");
            await getNewRefreshToken(data["json"]["url"]);
            break;
        case 403:
            console.error("no refresh token!");
            break
        case 500:
            console.error("somethings very wrong!")
            break;
        default:
            console.error("??????")
            break
    }
}

async function getNewRefreshToken(refreshURL: string) {
    const data: object = await requestService.handleFetch(Fetch.GET, Route.account, refreshURL, Accept.JSON);
    switch (data["status"]) {
        case 200:
            console.log("Retrieved a new refresh token successfully");
            break;
        case 500:
            console.log("not good");
            break;
        default:
            console.log("???");
            break;
    }
}

export async function getBrowserFingerprint() {
    const fp = await fpPromise;
    const result = await fp.get();
    console.log("fingerprint: " + result.visitorId);
    return result.visitorId;
}

