import { User, UserGeneral } from "../../apis/get_user";
import { useState } from "react";
import { PostUserGeneral } from "../../apis/post_user";

import { countries } from "countries-list";

function defaultArray(arr: string[] | undefined, len: number) {
  let copy: string[] = arr ? arr : [];

  if (copy.length < len) {
    let toAdd = len - copy.length;
    for (let x = 1; x <= toAdd; x++) {
      copy.push("");
    }
  }

  return copy;
}

const countriesOrdered = Object.entries(countries)
  .map((value: [string, any]) => {
    return value[1].name + " - " + value[0];
  })
  .sort((a, b) => {
    return a < b ? -1 : 1;
  });

export function UserGeneralForm(props: {
  clientServer: string;
  cookie: string;
  user: User;
}) {
  const [edit, setEdit] = useState<boolean>(false);

  const [country, setCountry] = useState<string>(
    props.user.user_general ? props.user.user_general?.country : ""
  );

  const [description, setDescription] = useState<string>(
    props.user.user_general ? props.user.user_general.description : ""
  );

  const [aesthetics, setAesthetics] = useState<string[]>(
    defaultArray(props.user.user_general?.aesthetics, 5)
  );

  const [links, setLinks] = useState<string[]>(
    defaultArray(props.user.user_general?.links, 3)
  );

  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <form className="">
      <div className={`${flex} my-2`}>
        <div className="font-bold mr-2 ">Country</div>
        {!edit ? (
          <div className="mr-2">{country ? country : "(none)"}</div>
        ) : (
          <select
            className="border-2 border-black rounded"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">--Please select one--</option>
            {countriesOrdered.map((value, idx) => {
              let countryName = value.split(" - ")[0];
              return (
                <option value={value} key={`country-${idx}`}>
                  {countryName}
                </option>
              );
            })}
          </select>
        )}
      </div>

      <div className={`my-2 flex`}>
        <div className="font-bold mr-2">Description</div>
        {!edit ? (
          description ? (
            description
          ) : (
            "none"
          )
        ) : (
          <textarea
            className="w-full"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </div>

      <div className={`my-2`}>
        <span className="font-bold">Aesthetics </span>
        {!edit && aesthetics.filter((a) => a != "").length > 0
          ? aesthetics.filter((a) => a != "").join(", ")
          : !edit && "(none)"}
        {edit && (
          <>
            <div className="text-xs font-normal">
              How would you describe your aesthetic? Add up to 5 descriptions
            </div>

            <div className="w-full">
              {aesthetics.map((a, idx) => (
                <input
                  className="w-full mb-2"
                  type="text"
                  key={`aesthetics-${idx}`}
                  value={a}
                  onChange={(e) => {
                    let a = [...aesthetics];
                    a[idx] = e.target.value;
                    setAesthetics(a);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={`my-2`}>
        <span className="font-bold ">Links </span>
        {!edit && links.filter((a) => a != "").length > 0
          ? links.filter((a) => a != "").join(", ")
          : !edit && "(none)"}
        {edit && (
          <>
            <div className="text-xs ">
              Links appear on your closet page and are visible to the public. Up
              to 3.
            </div>
            <div>
              {links.map((link, idx) => (
                <input
                  className="w-full mb-2"
                  type="text"
                  key={`link-${idx}`}
                  value={link}
                  onChange={(e) => {
                    let l = [...links];
                    l[idx] = e.target.value;
                    setLinks(l);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {submitError && (
        <div className="bg-red-500 p-1 my-2 text-white rounded">
          Oh no! We apologize, it looks like we are having server issues. Please
          refresh the page and try again.
        </div>
      )}

      {!edit ? (
        <button
          className="inverseButton"
          onClick={(e) => {
            e.preventDefault();
            setEdit(true);
          }}
        >
          edit
        </button>
      ) : (
        <>
          <button
            className="inverseButton mr-2"
            onClick={async (e) => {
              e.preventDefault();
              setEdit(false);

              let data: UserGeneral = {
                country: country,
                description: description,
                aesthetics: aesthetics,
                links: links,
              };

              const resp = await PostUserGeneral(
                props.clientServer,
                props.cookie,
                data
              );
              if (resp instanceof Error) {
                setSubmitError(resp.message);
              } else {
                location.reload();
              }
            }}
          >
            submit
          </button>

          <button
            className="primaryButton"
            onClick={(e) => {
              e.preventDefault();
              setCountry(
                props.user?.user_general?.country
                  ? props.user.user_general.country
                  : ""
              );
              setDescription(
                props.user?.user_general?.description
                  ? props.user.user_general.description
                  : ""
              );
              setAesthetics(
                defaultArray(props.user.user_general?.aesthetics, 5)
              );

              setLinks(defaultArray(props.user.user_general?.links, 3));

              setEdit(false);
            }}
          >
            cancel
          </button>
        </>
      )}
    </form>
  );
}

const flex = "flex flex-initial justify-start self-center flex-wrap";
