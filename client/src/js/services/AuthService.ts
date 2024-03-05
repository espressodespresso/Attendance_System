import FingerprintJS from '@fingerprintjs/fingerprintjs';
import fpPromise from "../index";

export async function verifyStatus(username: string, password: string, fingerprint: string): Promise<boolean> {
    let status = true;
    const loginURL = 'http://localhost:8080/login';
    try {
        const response = await fetch(loginURL, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": username, "password": password, "fingerprint": fingerprint })
        });

        const data = response.headers.get("Set-Cookie");
    } catch (error) {
        console.error("Error: " + error);
    }

    return status;
}

export async function getPayloadData() {
    const accountURL = 'http://localhost:8080/account';
    try {
        const response = await fetch(accountURL, {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log(response.status);
        if(response.status === 401) {
            await getNewAuthToken();
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error: " + error);
    }

}

async function getNewAuthToken() {
    const refreshURL = 'http://localhost:8080/account/refresh';
    console.log("ENTER " + await getBrowserFingerprint())

    try {
        const response = await fetch(refreshURL, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "fingerprint": await getBrowserFingerprint() })
        });

        switch (response.status) {
            case 200:
                console.log("good to go!");
                break;
            case 403:
                console.log("no refresh token!");
                break
            case 500:
                console.log("somethings very wrong!")
                break;
            default:
                console.log("??????")
                break
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