export function GetServerURL(clientSide?: boolean): (string | Error) {
    if (!process.env.NEXT_PUBLIC_SERVER_URL) {
        return new Error("NEXT_PUBLIC_SERVER_URL env not set")
    }

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

export function GetImageServerURL(): (string | Error) {
    if (!process.env.NEXT_PUBLIC_SERVER_URL) {
        return new Error("NEXT_PUBLIC_SERVER_URL env not set")
    }
       

    if (!process.env.NEXT_PUBLIC_IMAGE_SERVER_URL) {
        return new Error("NEXT_PUBLIC_IMAGE_SERVER_URL env not set")
    }

    if (process.env.NODE_ENV == "production") {
        return process.env.NEXT_PUBLIC_SERVER_URL
    }

    if (process.env.NODE_ENV == "development") {
        return "http://localhost:8002"       
    }

    return process.env.NEXT_PUBLIC_IMAGE_SERVER_URL
}

export function GetAuthServerURL(): (string | Error) {
    if (!process.env.NEXT_PUBLIC_SERVER_URL) {
        return new Error("NEXT_PUBLIC_SERVER_URL env not set")
    }
       

    if (!process.env.NEXT_PUBLIC_AUTH_SERVER_URL) {
        return new Error("NEXT_PUBLIC_AUTH_SERVER_URL env not set")
    }

    if (process.env.NODE_ENV == "production") {
        return process.env.NEXT_PUBLIC_SERVER_URL
    }

    if (process.env.NODE_ENV == "development") {
        return "http://localhost:8003"       
    }

    return process.env.NEXT_PUBLIC_AUTH_SERVER_URL
}