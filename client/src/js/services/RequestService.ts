import {Accept} from "../enums/Accept.enum";
import js from "../index";

export class RequestService {
    async FetchPOSTRequest(url: string, body: string, accept: Accept): Promise<object> {
        try {
            let response: Response;
            let data: object;
            switch (accept) {
                case Accept.JSON:
                    response = await fetch(url, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: body
                    });

                    let json: object;
                    try {
                        json = await response.json();
                    } catch {
                        json = {};
                    }

                    data = {
                        json:  json,
                        status: response.status
                    }
                    break;

                case Accept.Text:
                    response = await fetch(url, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Accept": "application/text",
                            "Content-Type": "application/text"
                        },
                        body: body
                    });

                    let text: string;
                    try {
                        text = await response.text();
                    } catch {
                        text = "";
                    }

                    data = {
                        text: text,
                        status: response.status
                    };
                    break;
            }

            return data;
        } catch (e) {
            console.error(e);
        }
    }

    async FetchGETRequest(url: string, accept: Accept): Promise<object> {
        try {
            let response: Response;
            let data: object;
            switch (accept) {
                case Accept.JSON:
                    response = await fetch(url, {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        }
                    });

                    let json: object;
                    try {
                        json = await response.json();
                    } catch {
                        json = {};
                    }

                    data = {
                        json:  json,
                        status: response.status
                    }
                    break;
                case Accept.Text:
                    response = await fetch(url, {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Accept": "application/text",
                            "Content-Type": "application/text"
                        }
                    });

                    let text: string;
                    try {
                        text = await response.text();
                    } catch {
                        text = "";
                    }

                    data = {
                        text: text,
                        status: response.status
                    };
                    break;
            }

            return data;
        } catch (e) {
            console.error(e);
        }
    }

    async FetchDELETERequest(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Accept": "application/text",
                    "Content-Type": "application/text"
                }
            });

            switch (response.status) {
                case 200:
                    return true;
                default:
                    return false;
            }
        } catch (e) {
            console.error(e);
        }
    }
}