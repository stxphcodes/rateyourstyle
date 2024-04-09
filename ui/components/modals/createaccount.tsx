import { useState } from "react";

import { PostUser } from "../../apis/post_user";
import { Modal } from "./";
import { GetServerURL } from "../../apis/get_server";

export function CreateAccount(props: {
  clientServer: string;
  handleClose: any;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>(
    "missing required fields"
  );

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValidationError("");
    if (event.target.id == "username") {
      setUsername(event.target.value);
    }

    if (event.target.id == "password") {
      setPassword(event.target.value);
    }

    if (event.target.id == "email") {
      setEmail(event.target.value);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (username.length < 3) {
      setValidationError("Username is too short.");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Email is invalid.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password is too short.");
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
      <Modal handleClose={props.handleClose}>
        <div>
          <h3>Uh oh. Looks like we encountered a server issue on our end.</h3>
          If the issue persists, pleae email sitesbystephanie @gmail.com
        </div>
      </Modal>
    );
  }

  return (
    <Modal handleClose={props.handleClose}>
      <>
        <h1>Create an Account</h1>
        {error && error.includes("taken") && (
          <div className="p-2 my-2 bg-red-500 text-white">
            {error}. please choose another.
          </div>
        )}

        {validationError && !validationError.includes("missing") && (
          <div className="p-2 my-2 bg-red-500 text-white">
            {validationError}
          </div>
        )}
        <form className="">
          <div className="mb-4">
            <label htmlFor="Email">Email</label>
            <input
              className="w-full"
              id="email"
              type="text"
              placeholder="Email"
              onChange={handleInputChange}
              value={email}
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
            />
            <label htmlFor="Email" className="requiredLabel">
              Required
            </label>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="primaryButton"
              type="submit"
              onClick={handleSubmit}
              disabled={validationError !== ""}
            >
              Create Account
            </button>
          </div>
        </form>
      </>
    </Modal>
  );
}
