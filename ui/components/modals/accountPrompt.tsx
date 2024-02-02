import { useState } from "react";
import { Modal } from "./";
import { SignIn } from "./signin";
import { CreateAccount } from "./createaccount";
import Link from "next/link";

export function AccountPromptModal(props: { clientServer: string }) {
  const [signInClicked, setSignInClicked] = useState<boolean>(false);
  const [createAccountClicked, setCreateAccountClicked] =
    useState<boolean>(false);
  return (
    <Modal
      handleClose={() => (window.location.href = "/")}
      wideScreen={true}
      noPadding={true}
    >
      <div className="py-20">
        {signInClicked && (
          <SignIn
            clientServer={props.clientServer}
            handleClose={() => setSignInClicked(false)}
          />
        )}

        {createAccountClicked && (
          <CreateAccount
            clientServer={props.clientServer}
            handleClose={() => setCreateAccountClicked(false)}
          />
        )}

        <div className="text-center">
          <h3 className="pb-4">Um excuse me, I need to see some ID.</h3>
          <img
            src="/henry.jpg"
            className="w-3/4 sm:w-1/2 m-auto"
            alt="the jackest jack russell in all of existence is a bouncer for the page."
          />
          <p className="py-4 text-xl">
            Please{" "}
            <a onClick={() => setSignInClicked(!signInClicked)}>sign in</a> or{" "}
            <a onClick={() => setCreateAccountClicked(!createAccountClicked)}>
              create an account
            </a>
            .{" "}
          </p>
          <p>
            Go back to{" "}
            <Link href="/" passHref={true}>
              <a>Home</a>
            </Link>
          </p>
        </div>
      </div>
    </Modal>
  );
  // }
}
