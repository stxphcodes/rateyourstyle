import { useState, useEffect } from "react"
import { Modal } from "./";
import { SignIn } from "./signin";
import { CreateAccount } from "./createaccount";
export function AccountPromptModal(props: { clientServer: string }) {
    const [signInClicked, setSignInClicked] = useState<boolean>(false)
    const [createAccountClicked, setCreateAccountClicked] = useState<boolean>(false)
    return (
        <Modal handleClose={null} wideScreen={true} noPadding={true}>
            <div className="h-96 py-96 items-center  justify-center flex">
                {
                    signInClicked &&
                    <SignIn
                        clientServer={props.clientServer}
                        handleClose={() => setSignInClicked(false)} />}

                {
                    createAccountClicked &&
                    <CreateAccount
                        clientServer={props.clientServer}
                        handleClose={() => setCreateAccountClicked(false)} />
                }


                <h3 className="text-center">For unrestricted access, please <a onClick={() => setSignInClicked(!signInClicked)}>sign in</a> or <a onClick={() => setCreateAccountClicked(!createAccountClicked)}>create an account</a>.</h3>
            </div>
        </Modal>

    )
    // }
}