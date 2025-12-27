const codeMessageMapping = {
  "auth/account-exists-with-different-credential": "The email is already associated with a different account",
  "auth/auth-domain-config-required": "Config parameters are missing",
  "auth/cancelled-popup-request": "Only one sign up/in pop up is allowed to be active",
  "auth/unauthorized-domain": "Unauthorized domain for the requested operation",
  "auth/operation-not-allowed": "The requested provider type is not supported",
  "auth/operation-not-supported-in-this-environment": "The requested operation is not supported in the current environment",
  "auth/popup-blocked": "The sign up/in pop up has been blocked by the browser",
  "auth/credential-already-in-use": "The provided credentials is already in use",
  "auth/email-already-in-use": "The provided email is already in use",
  "auth/email-change-needs-verification": "The email must be verified before it can be changed",
  "auth/user-disabled": "The user associated with the provided credentials has been disabled",
  "auth/internal-error": "Internal error occurred. Please, try again later",
  "auth/invalid-user-token": "Invalid user token",
  "auth/invalid-credential": "The provided login and/or password are incorrect",
  "auth/wrong-password": "Wrong password",
  "auth/user-not-found": "The user associated with the provided credentials has not been found",
  "auth/invalid-email": "Invalid email address",
  "default": "Unknown error has occurred. Please try again later.",
}

export const processErrors = (code) => {
  if (code in codeMessageMapping) return codeMessageMapping[code]
  return `${codeMessageMapping["default"]}: ${code}`
}