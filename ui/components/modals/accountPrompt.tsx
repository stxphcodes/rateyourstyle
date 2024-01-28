import { useState } from "react"
import { Modal } from "./";
import { SignIn } from "./signin";
import { CreateAccount } from "./createaccount";
import Link from "next/link";
export function AccountPromptModal(props: { clientServer: string }) {
    const [signInClicked, setSignInClicked] = useState<boolean>(false)
    const [createAccountClicked, setCreateAccountClicked] = useState<boolean>(false)
    return (
        <Modal handleClose={null} wideScreen={true} noPadding={true}>
            <div className="py-64 md:py-80 px-4">
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


                <h3 className="text-center">
                    To view this page, please{' '}
                    <a onClick={() => setSignInClicked(!signInClicked)}>sign in</a>
                    {' '}or {' '}
                    <a onClick={() => setCreateAccountClicked(!createAccountClicked)}>create an account</a>.
                </h3>

                <h4 className="basis-full text-center pt-4">Go back to <Link href="/" passHref={true}><a>Home</a></Link></h4>
            </div>
        </Modal>

    )
    // }
}