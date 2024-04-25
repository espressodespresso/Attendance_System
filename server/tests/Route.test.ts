import {loginRoute} from "../src/routes/LoginRoute";
import {accountRoute} from "../src/routes/AccountRoute";
import {moduleRoute} from "../src/routes/ModuleRoute";
import {analyticsRoute} from "../src/routes/AnalyticsRoute";
import {attendanceRoute} from "../src/routes/AttendanceRoute";
import {Collection} from "../src/enums/Collection.enum";
import {ServiceFactory} from "../src/services/ServiceFactory";
import {IMongoService} from "../src/services/MongoService";

// Test Fingerprint Strings
let fingerprint: string = null;
let alt_fingerprint: string = null;

// Test Cookie Strings
let cookies: string = null;
let alt_cookies: string = null;
let temp: string = null;

// Test Module Object
let testModule = {
    name: "test_module",
    enrolled: [process.env.ALT_USERNAME],
    leader: process.env.USERNAME,
    timetable: [new Date("2024-04-09T11:00:00.000Z"), new Date("2024-04-16T11:00:00.000Z")],
};

beforeAll(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charsIndexLength = chars.length - 1;
    for(let i = 0; i < 20; i++) {
        fingerprint = `${fingerprint}${chars[Math.random() * charsIndexLength]}`;
    }
    for(let i = 0; i < 20; i++) {
        fingerprint = `${fingerprint}${chars[Math.random() * charsIndexLength]}`;
    }
})

afterAll(async () => {
    // AccountRoute Logout Test
    const header = new Headers;
    header.set('cookie', cookies);
    const accountRes = await accountRoute.request('/logout', {
        method: 'DELETE',
        headers: header
    })

    expect(accountRes.status).toBe(200);

    // ModuleRoute Delete Test Module
    const moduleRes = await moduleRoute.request(`/delete/${testModule["name"]}`, {
        method: 'DELETE',
        headers: header
    });

    expect(moduleRes.status).toBe(200);

    // Delete Test Module Attendance Data
    const mongoService: IMongoService = ServiceFactory.createMongoService();
    const response: object = await mongoService.handleConnection
    (async (): Promise<object> => {
        const query = {module: testModule["name"]}
        return await mongoService.deleteMany(query, Collection.attendance);
    });

    expect(response["status"]).toBe(true);
})

describe('API routes', () => {
    describe('LoginRoute', () => {
        describe('/', () => {
            test("Sends username and password and should receive back JWT Tokens as cookies", async () => {
                // Work around for Hono Testing Suite bug
                const authBody = {
                    username: process.env.USERNAME,
                    password: process.env.PASSWORD,
                    fingerprint: fingerprint,
                    testing: true
                }

                const authRes = await loginRoute.request('/', {
                    method: 'POST',
                    body: JSON.stringify(authBody),
                });

                expect(authRes.status).toBe(200);
                expect(authRes.headers.getSetCookie()[0].includes("token")).toBe(true);
                cookies = `${authRes.headers.getSetCookie()[0].split(';')[0]}; `

                const refreshBody = {
                    username: process.env.USERNAME,
                    password: process.env.PASSWORD,
                    fingerprint: fingerprint,
                    testing: false
                }

                const refreshRes = await loginRoute.request('/', {
                    method: 'POST',
                    body: JSON.stringify(refreshBody),
                });

                expect(refreshRes.status).toBe(200);
                expect(refreshRes.headers.getSetCookie()[0].includes("refresh_token")).toBe(true);
                cookies = `${cookies}${refreshRes.headers.getSetCookie()[0].split(';')[0]}`
            })

            test("Sends alt username and password and should receive back JWT Tokens as cookies", async () => {
                // Work around for Hono Testing Suite bug
                const authBody = {
                    username: process.env.ALT_USERNAME,
                    password: process.env.PASSWORD,
                    fingerprint: alt_fingerprint,
                    testing: true
                }

                const authRes = await loginRoute.request('/', {
                    method: 'POST',
                    body: JSON.stringify(authBody),
                });

                expect(authRes.status).toBe(200);
                expect(authRes.headers.getSetCookie()[0].includes("token")).toBe(true);
                alt_cookies = `${authRes.headers.getSetCookie()[0].split(';')[0]}; `

                const refreshBody = {
                    username: process.env.ALT_USERNAME,
                    password: process.env.PASSWORD,
                    fingerprint: alt_fingerprint,
                    testing: false
                }

                const refreshRes = await loginRoute.request('/', {
                    method: 'POST',
                    body: JSON.stringify(refreshBody),
                });

                expect(refreshRes.status).toBe(200);
                expect(refreshRes.headers.getSetCookie()[0].includes("refresh_token")).toBe(true);
                alt_cookies = `${alt_cookies}${refreshRes.headers.getSetCookie()[0].split(';')[0]}`
            })
        });
    });

    describe('AccountRoute', () => {
        describe('/', () => {
            test("Sends token cookies and receive the user information", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await accountRoute.request('/', {
                    headers: header
                })

                expect(res.status).toBe(200);
                expect(await res.json()).toHaveProperty("userinfo");
            })
        });

        describe('/auth', () => {
            test("Sends token cookies and fingerprint and receives a new auth token and redirection url", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await accountRoute.request('/auth', {
                    method: 'POST',
                    headers: header,
                    body: JSON.stringify({fingerprint: fingerprint})
                })

                expect(res.status).toBe(200);
                const url = await res.json();
                expect(url).toHaveProperty("url");
                expect(res.headers.getSetCookie()[0].includes("token")).toBe(true);
                temp = `${res.headers.getSetCookie()[0].split(';')[0]}; `;
            })
        });

        describe('/refresh', () => {
            test("Sends token cookies and receives a new refresh token", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await accountRoute.request('/refresh', {
                    headers: header
                })

                expect(res.status).toBe(200);
                expect(res.headers.getSetCookie()[0].includes("refresh_token")).toBe(true);
                cookies = `${temp}${res.headers.getSetCookie()[0].split(';')[0]}`;
                temp = null;
            })
        });

        describe('/verify/:username', () => {
            test("Sends token cookies, a username param and verifies if a user exists", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await accountRoute.request(`/verify/${process.env.USERNAME}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const valid = await res.json();
                expect(valid).toHaveProperty("valid")
                expect(valid["valid"]).toBe(true);
            })
        });
    });

    describe('ModuleRoute', () => {
        describe('/create', () => {
            test("Sends token cookies, a module object body and returns a status object", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await moduleRoute.request(`/create`, {
                    method: 'POST',
                    headers: header,
                    body: JSON.stringify(testModule)
                });

                expect(res.status).toBe(200);
                expect(await res.json()).toHaveProperty("message");
            })
        });

        describe('/list', () => {
            test("Sends token cookies and returns an array of module objects", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await moduleRoute.request(`/list`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                expect(Array.isArray(await res.json())).toBe(true);
            })
        });

        describe('/:name', () => {
            test("Sends token cookies, a module name param and returns an module object", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await moduleRoute.request(`/${testModule["name"]}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                expect(JSON.parse(await res.json())["name"]).toBe(testModule["name"]);
            })
        });

        describe('/update', () => {
            test("Sends token cookies, a body and returns the status", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const prevName = testModule["name"];
                testModule["name"] = "test_module_updated";
                const body = {
                    name: prevName,
                    data: testModule
                }
                const res = await moduleRoute.request(`/update`, {
                    method: 'POST',
                    headers: header,
                    body: JSON.stringify(body)
                })

                expect(res.status).toBe(200);
            })
        });

        describe('/userlist', () => {
            test("Sends token cookies and returns an object array of modules for the user", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await moduleRoute.request(`/userlist`, {
                    headers: header
                })

                expect(res.status).toBe(200);
                expect(await res.json()).toHaveProperty("data");
            })
        });
    })

    describe('AnalyticsRoute', () => {
        describe('/attendance/:user/:module', () => {
            test("Sends token cookies, a username param, a module param and returns the users module attendance data", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await analyticsRoute.request(`/attendance/${process.env.ALT_USERNAME}/${testModule["name"]}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const data = JSON.parse(await res.json())["data"];
                expect(data).toHaveProperty("datasets");
                expect(Array.isArray(data["datasets"])).toBe(true);
            })
        });

        describe('/attendance/:module', () => {
            test("Sends token cookies, a module param and returns the modules attendance data", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await analyticsRoute.request(`/attendance/${testModule["name"]}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const data = JSON.parse(await res.json())["graph"];
                expect(data).toHaveProperty("datasets");
                expect(Array.isArray(data["datasets"])).toBe(true);
            })
        });

        describe('/attendance/avg/:module/data', () => {
            test("Sends token cookies, a module param and returns the averaged module attendance data", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await analyticsRoute.request(`/attendance/avg/${testModule["name"]}/data`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const data = JSON.parse(await res.json())["data"];
                expect(data).toHaveProperty("datasets");
                expect(Array.isArray(data["datasets"])).toBe(true);
            })
        });

        describe('/table/:user/:module', () => {
            test("Sends token cookies, a module param, a username param and returns an object of table strings", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await analyticsRoute.request(`/table/${process.env.ALT_USERNAME}/${testModule["name"]}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const data = JSON.parse(await res.json());
                expect(data["headStrings"]).toBeTruthy();
                expect(data["bodyStrings"]).toBeTruthy();
            })
        });

        describe('/table/:module', () => {
            test("Sends token cookies, a module param and returns an object of table strings", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await analyticsRoute.request(`/table/${testModule["name"]}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const data = JSON.parse(await res.json());
                expect(data["headStrings"]).toBeTruthy();
                expect(data["bodyStrings"]).toBeTruthy();
            })
        });

        describe('/indextable', () => {
            test("Sends token cookies and returns an object of table strings", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await analyticsRoute.request(`/indextable`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const data = JSON.parse(await res.json());
                expect(data["headStrings"]).toBeTruthy();
                expect(data["bodyStrings"]).toBeTruthy();
            })
        });
    });

    describe('AttendanceRoute', () => {
        let active_code: number = null;
        describe('/take/:name/:date', () => {
            test("Sends token cookies, a module param, a date param and returns a code object", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await attendanceRoute.request(`/take/${testModule["name"]}/${testModule["timetable"][0]}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
                const data = await res.json();
                expect(data).toHaveProperty("active_code");
                active_code = data["active_code"];
            })
        });

        describe('/attend/:code', () => {
            test("Sends alt token cookies and returns an status object", async () => {
                const header = new Headers;
                header.set('cookie', alt_cookies);
                const res = await attendanceRoute.request(`/attend/${active_code}`, {
                    method: 'POST',
                    headers: header
                });

                expect(res.status).toBe(200);
            })
        });

        // Function is never used by the front-end client
        /*describe('/details/:name/:date', () => {
            test("Sends token cookies, a module param, a date param and returns a data object", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await attendanceRoute.request(`/details/${testModule["name"]}/${testModule["timetable"][0]}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
            })
        });*/

        describe('/end/:code', () => {
            test("Sends token cookies, a code param and returns a status object", async () => {
                const header = new Headers;
                header.set('cookie', cookies);
                const res = await attendanceRoute.request(`/end/${active_code}`, {
                    headers: header
                });

                expect(res.status).toBe(200);
            })
        });
    });
});