export function GetServerURL(clientSide?: boolean) {
    if (clientSide && process.env.NODE_ENV == "development") {
        return "http://localhost:8000"
    }

    if (process.env.NEXT_PUBLIC_SERVER_URL ) {
        return process.env.NEXT_PUBLIC_SERVER_URL
    }

    if (process.env.NODE_ENV == "development") {
        return "http://localhost:8000"
    }

    return window.location.href
}