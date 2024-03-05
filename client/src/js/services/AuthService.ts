export async function verifyStatus(username: string, password: string): Promise<boolean> {
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
            body: JSON.stringify({ "username": username, "password": password })
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

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error: " + error);
    }

}