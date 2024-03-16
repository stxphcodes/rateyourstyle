import { User } from "../../apis/get_user";
import { useMemo, useEffect, useState } from "react";
export function ClosetHeader(props: {
  closetName: string;
  outfitCount: number;
  outfitItemCount: number;
  user?: User | null;
  imageURLs: string[] | null;
}) {
  const aestheticsFiltered = useMemo(
    () => props.user?.user_general?.aesthetics.filter((a) => a),
    []
  );

  const linksFiltered = useMemo(
    () => props.user?.user_general?.links.filter((l) => l),
    []
  );

  const [profileImage, setProfileImage] = useState(
    props.imageURLs ? props.imageURLs[0] : null
  );

  useEffect(() => {
    if (!props.imageURLs) {
      return;
    }

    let id = setInterval(() => {
      if (props.imageURLs) {
        let num = Math.floor(Math.random() * props.imageURLs?.length);
        setProfileImage(props.imageURLs[num]);
      }
    }, 3000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full md:w-1/2">
      <div className="flex gap-2 items-center">
        {profileImage && (
          <img
            src={profileImage}
            className="object-contain w-12 h-12 rounded-full"
          />
        )}
        <h1 className="capitalize mb-1">{props.closetName}&apos;s Closet</h1>
      </div>

      <div className="flex gap-4 my-2">
        <h6>
          <span className="font-bold">{props.outfitCount}</span> Outfits
        </h6>

        <h6>
          <span className="font-bold">{props.outfitItemCount}</span> Clothing
          Items
        </h6>
      </div>

      {props.user?.user_general?.country && (
        <div>
          <span className="font-bold">Country</span>:{" "}
          {props.user?.user_general?.country}
        </div>
      )}

      {aestheticsFiltered && aestheticsFiltered.length > 0 && (
        <div className="font-bold flex flex-wrap gap-2 items-center">
          Aesthetic:
          {aestheticsFiltered.map((item) => (
            <div
              className="rounded-full px-1 font-normal bg-gradient"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 mb-2">{props.user?.user_general?.description}</div>

      {linksFiltered && linksFiltered.length > 0 && (
        <ul>
          {linksFiltered.map((link, index) => (
            <li key={"link-" + index}>
              <a href={link} target="_blank">
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
