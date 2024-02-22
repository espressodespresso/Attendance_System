export async function verifyStatus(username: String, password: String): Promise<boolean> {
    let status = true;
    const loginURL = 'http://localhost:8080/login';
    await fetch(loginURL, {
        method: "POST",
        credentials: 'include',
        headers: {
            'Accept': 'text/plain',
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ "username": username, "password": password })
    }).then(resp => {
        console.log(resp.headers.get("Set-Cookie"))
    })

    return status;
}