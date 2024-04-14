import {Accept} from "../enums/Accept.enum";
import {Fetch} from "../enums/Fetch.enum";
import {Route} from "../enums/Route.enum";

export class RequestService {
    private apiAddress: string = "http://localhost:8080/";

    async handleFetch(fetch: Fetch, route: Route, url: string, accept?: Accept, body?: string): Promise<object> {
        let tempRoute: string = null;
        switch (route) {
            case Route.account:
                tempRoute = "account";
                break;
            case Route.analytics:
                tempRoute = "analytics";
                break;
            case Route.attendance:
                tempRoute = "attendance";
                break;
            case Route.login:
                tempRoute = "login";
                break;
            case Route.module:
                tempRoute = "module";
                break;
        }
        const completedAddress = `${this.apiAddress}${tempRoute}${url}`;
        try {
            let data: object = null;
            switch (fetch) {
                case Fetch.GET:
                    data = this.FetchGETRequest(completedAddress, accept);
                    break;
                case Fetch.POST:
                    data = this.FetchPOSTRequest(completedAddress, body, accept);
                    break;
                case Fetch.DELETE:
                    data = {
                        success: this.FetchDELETERequest(completedAddress)
                    };
                    break;
            }

            return data;
        } catch (e) {
            console.error(`No tokens\n${e}`);
        }
    }

    private async FetchPOSTRequest(url: string, body: string, accept: Accept): Promise<object> {
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

    private async FetchGETRequest(url: string, accept: Accept): Promise<object> {
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