export function GetServerURL(clientSide?: boolean) {
    if (process.env.NODE_ENV == "production") {
        return process.env.NEXT_PUBLIC_SERVER_URL
    }

    if (process.env.NODE_ENV == "development") {
        if (clientSide) {
            return "http://localhost:8000"
        }

        return process.env.NEXT_PUBLIC_SERVER_URL
    }

    if (clientSide) {
        return window.location.hostname
    }

   return process.env.NEXT_PUBLIC_SERVER_URL
}