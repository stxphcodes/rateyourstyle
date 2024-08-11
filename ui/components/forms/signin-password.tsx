import { useState } from "react";

import { PostSigninPassword } from "../../apis/post_signin";
import { PrimaryButton } from "../base/buttons/primary";

export function PasswordSigninForm(props: { authServer: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.id == "username") {
      let username = event.target.value;
      setUsername(username.toLowerCase());
    }

    if (event.target.id == "password") {
      setPassword(event.target.value);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const resp = await PostSigninPassword(props.authServer, username, password);
    if (resp instanceof Error) {
      setError(resp.message);
      return;
    }

    document.cookie = resp;
    location.reload();
    return;
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
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
            autoCapitalize="off"
            autoCorrect="off"
          ></input>
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
            autoCapitalize="off"
          ></input>
        </div>
        <div className="flex items-center justify-between">
          <PrimaryButton isSubmit={true}>Submit</PrimaryButton>
        </div>
      </form>

      {error && (
        <div className="py-2 text-red-500 font-bold">
          Incorrect username or password.
        </div>
      )}
    </>
  );
}
