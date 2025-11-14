export const processErrors = (code) => {
  let message = '';
  switch (code) {
    case "auth/credential-already-in-use":
      message = "The provided credentials are already in use.";
      break;
    case "auth/email-already-in-use":
      message = "The provided email is already in use"
      break;
    case "auth/email-change-needs-verification":
      message = "The email must be verified before it can be changed"
      break;
    case "auth/internal-error":
      message = "Internal error occurred. Please, try again later"
      break;
    case "auth/invalid-user-token":
      message = "Invalid user token"
      break;
    case "auth/invalid-credential":
      message = "The provided login and/or password are incorrect"
      break;
    case "auth/wrong-password":
      message = "Wrong password"
      break;
    case "auth/user-not-found":
      message = "The user with such email has not been found"
      break;
    case "auth/invalid-email":
      message = "Invalid email address"
      break;
    default:
      message = code
  }

  return message;
}