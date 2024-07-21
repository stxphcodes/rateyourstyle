export const StatusCodes = {
    OK: 200,
    OK_CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    FAILED_DEPENDENCY: 424,
    INTERNAL_SERVER_ERROR: 500,
}

export const ERR_GENERAL_INTERNAL_SERVER = "Oops, something went wrong with your request. Please try again momentarily, or report the issue to rateyourstyle@gmail.com"
export const ERR_GENERAL_BAD_REQUEST = "Oops, something is wrong with your request."

// Sign up Form Errors 
export const ERR_SIGNUP_BAD_REQUEST = "Please fill out all of the required fields."
export const ERR_SIGNUP_FAILED_DEPENDENCY_USERNAME = "The username you entered is taken. Please choose another."
export const ERR_SIGNUP_FAILED_DEPENDENCY_EMAIL = "The emailed you entered is already in our system. Please signin or use a different email."


// OTP Form Errors
export const ERR_GET_OTP_BAD_REQUEST = "Please enter your username or email."
export const ERR_GET_OTP_NOT_FOUND = "The username or email you entered is not in our system."
export const ERR_POST_OTP_INVALID = "The one time password you entered is incorrect."
export const ERR_POST_OTP_EXPIRED = "The one time password you entered has expired. Please request a new one."

