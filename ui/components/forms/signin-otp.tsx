import { useState, useEffect } from "react";

import { PostSigninOTP } from "../../apis/post_signin";
import { PrimaryButton } from "../base/buttons/primary";
import { GetOTP } from "../../apis/get_otp";
import LoadingGIF from "../icons/loader-gif";

export function OTPForm(props: {
  authServer: string;
  sentEmail?: boolean;
  email?: string;
}) {
  const [usernameOrEmail, setUsernameOrEmail] = useState(
    props.email ? props.email : ""
  );
  const [sentEmail, setSentEmail] = useState(
    props.sentEmail ? props.sentEmail : false
  );
  const [loading, setLoading] = useState(false);
  const [otp, setOTP] = useState("");

  const [error, setError] = useState<string | null>(null);

  const sendEmail = async () => {
    setLoading(true);
    const resp = await GetOTP(props.authServer, usernameOrEmail);
    setLoading(false);

    if (!(resp instanceof Error)) {
      setSentEmail(true);
    } else {
      setError(resp.message);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (event.target.id == "usernameOrEmail") {
      let value = event.target.value;
      setUsernameOrEmail(value.toLowerCase());
    }

    if (event.target.id == "otp") {
      let value = event.target.value;
      setOTP(value);
    }
  };

  const handleSignin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const resp = await PostSigninOTP(props.authServer, usernameOrEmail, otp);
    setLoading(false);

    if (resp instanceof Error) {
      setError(resp.message);
      return;
    }

    document.cookie = resp;
    location.reload();
    return;
  };

  return (
    <>
      <form>
        <div className="mb-4">
          <label className="" htmlFor="usernameOrEmail">
            {sentEmail
              ? "Your account username or email"
              : "Please enter your account username or email"}
          </label>
          <input
            className="w-full"
            id="usernameOrEmail"
            type="text"
            placeholder="Username or Email"
            onChange={handleInputChange}
            autoCapitalize="off"
            autoCorrect="off"
            disabled={sentEmail}
            value={usernameOrEmail}
          ></input>
        </div>
        {sentEmail && (
          <div className="mb-6">
            <label className="" htmlFor="usernameOrEmail">
              Please enter the one time password we sent to your email.
            </label>
            <input
              className="w-full"
              id="otp"
              type="text"
              placeholder="One time password"
              onChange={handleInputChange}
              autoCapitalize="off"
              autoCorrect="off"
            ></input>
          </div>
        )}

        <div className="flex items-center justify-between">
          {loading ? (
            <LoadingGIF />
          ) : !sentEmail ? (
            <PrimaryButton onClick={sendEmail} isSubmit={true}>
              Next
            </PrimaryButton>
          ) : (
            <PrimaryButton isSubmit={true} onClick={handleSignin}>
              Sign in
            </PrimaryButton>
          )}
        </div>
      </form>

      {error && <div className="py-2 text-red-500 font-bold">{error}</div>}
    </>
  );
}
