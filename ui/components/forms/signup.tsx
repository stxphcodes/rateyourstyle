import { useState } from "react";

import { PostUser } from "../../apis/post_user";
import { PrimaryButton } from "../Buttons/primary";

const ErrUsernameShort =
  "Username is too short. Please create a username greater than 3 characters.";
const ErrUsernameLong =
  "Username is too long. Please create a username less than 20 characters.";
const ErrEmailInvalid = "Your email is invalid.";
const ErrPasswordShort =
  "Password is too short. Please select a more secure password.";
const ErrTermsChecked = "Please read and agree to the Terms of Use.";

export function CreateAccount(props: { clientServer: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [termsChecked, setTermsChecked] = useState(false);
  const [validationError, setValidationError] = useState<string>(
    "missing required fields"
  );

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValidationError("");
    setError(null);
    if (event.target.id == "username") {
      let username = event.target.value;
      setUsername(username.toLowerCase());
    }

    if (event.target.id == "password") {
      setPassword(event.target.value);
    }

    if (event.target.id == "email") {
      setEmail(event.target.value);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.length < 3) {
      setValidationError(ErrUsernameShort);
      return;
    }

    if (username.length > 20) {
      setValidationError(ErrUsernameLong);
      return;
    }

    if (!email.includes("@")) {
      setValidationError(ErrEmailInvalid);
      return;
    }

    if (password.length < 6) {
      setValidationError(ErrPasswordShort);
      return;
    }

    if (!termsChecked) {
      setValidationError(ErrTermsChecked);
      return;
    }

    setValidationError("");

    const resp = await PostUser(props.clientServer, username, email, password);
    if (resp instanceof Error) {
      setError(resp.message);
      return;
    }

    document.cookie = resp;
    location.reload();
    return;
  }

  if (error && !error.includes("taken")) {
    return (
      <div>
        <h3>Uh oh. Looks like we encountered a server issue on our end.</h3>
        If the issue persists, pleae email sitesbystephanie @gmail.com
      </div>
    );
  }

  return (
    <>
      <form className="" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="Email">Email</label>
          <input
            className="w-full"
            id="email"
            type="text"
            placeholder="Email"
            onChange={handleInputChange}
            value={email}
            autoCapitalize="off"
          />
          <label htmlFor="Email" className="requiredLabel">
            Required
          </label>
        </div>
        <div className="mb-4">
          <label className="" htmlFor="username">
            Username
          </label>
          <input
            className="w-full"
            id="username"
            type="text"
            placeholder="Username"
            onChange={handleInputChange}
            value={username}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <label htmlFor="Email" className="requiredLabel">
            Required
          </label>
        </div>
        <div className="mb-6">
          <label className="" htmlFor="password">
            Password
          </label>
          <input
            className="w-full"
            id="password"
            type="password"
            placeholder="******************"
            onChange={handleInputChange}
            value={password}
            autoCapitalize="off"
          />
          <label htmlFor="Email" className="requiredLabel">
            Required
          </label>
        </div>
        <div className="flex gap-2 items-start mb-6">
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={() => {
              setValidationError("");
              setTermsChecked(!termsChecked);
            }}
          />
          <label>
            I agree to Rate Your Style's cookie policy. Rate Your Style uses
            cookies to maintain your login session. The cookie is only used for
            the purpose of saving your login details.
          </label>
        </div>

        <div className="flex items-center justify-between ">
          <PrimaryButton isSubmit={true} disabled={validationError !== ""}>
            Create Account
          </PrimaryButton>
        </div>

        {validationError && !validationError.includes("missing") && (
          <div className="my-2 text-red-500 font-bold">{validationError}</div>
        )}

        {error && error.includes("taken") && (
          <div className="my-2 text-red-500 font-bold">
            {error}. please choose another.
          </div>
        )}
      </form>
    </>
  );
}
