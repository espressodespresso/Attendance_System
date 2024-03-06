import fpPromise from "../index";
import {RequestService} from "./RequestService";
import {Accept} from "../enums/Accept.enum";

const requestService = new RequestService();

export async function verifyStatus(username: string, password: string, fingerprint: string) {
    const loginURL = 'http://localhost:8080/login';
    try {
        const body = JSON.stringify({ "username": username, "password": password, "fingerprint": fingerprint });
        return await requestService.FetchPOSTRequest(loginURL, body, Accept.JSON);
    } catch (e) {
        console.error("Invalid credentials");
    }


}

export async function getPayloadData() {
    const accountURL = 'http://localhost:8080/account';
    try {
        const data = await requestService.FetchGETRequest(accountURL, Accept.JSON);

        if(data["status"] === 401) {
            await getNewAuthToken();
        }

        return data;
    } catch (e) {
        console.error("No Tokens");
    }
}

async function getNewAuthToken() {
    const refreshURL = 'http://localhost:8080/account/auth';
    let body = JSON.stringify({ "fingerprint": await getBrowserFingerprint() });
    try {
        const data = await requestService.FetchPOSTRequest(refreshURL, body, Accept.JSON);
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
    } catch (e) {
        console.error("No Tokens")
    }
}

async function getNewRefreshToken(refreshURL: string) {

    try {
        const response = await fetch(refreshURL, {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        switch (response.status) {
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

    } catch (error) {
        console.error("Error: " + error);
    }
}

export async function getBrowserFingerprint() {
    //const fpPromise = FingerprintJS.load()
    const fp = await fpPromise;
    const result = await fp.get();
    console.log("fingerprint: " + result.visitorId);
    return result.visitorId;
}