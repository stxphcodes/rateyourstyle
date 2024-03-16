import { User, UserProfile } from "../../apis/get_user";
import { useState } from "react";
import { PostUserProfile } from "../../apis/post_user";

export function UserProfileForm(props: {
  clientServer: string;
  cookie: string;
  user: User;
}) {
  const [editUserProfile, setEditUserProfile] = useState<boolean>(false);
  const [department, setDepartment] = useState(
    props.user?.user_profile?.department
  );
  const [ageRange, setAgeRange] = useState(props.user?.user_profile?.age_range);
  const [heightRange, setHeightRange] = useState(
    props.user?.user_profile?.height_range
  );
  const [weightRange, setWeightRange] = useState(
    props.user?.user_profile?.weight_range
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <form className="">
      <div className="my-3">
        <div className={`${flex}`}>
          <div className="font-bold mr-2 ">Department</div>
          {!editUserProfile ? (
            <div className="mr-2">{department ? department : defaultLang}</div>
          ) : (
            <div className={flex}>
              {genderChoices.map((item) => (
                <div className={`${flex} mr-4`} key={item}>
                  <input
                    type="radio"
                    className="mr-1"
                    value={item}
                    checked={department == item}
                    onChange={() => setDepartment(item)}
                  ></input>
                  <label>{item == "" ? defaultLang : item}</label>
                </div>
              ))}
            </div>
          )}
        </div>
        {editUserProfile && (
          <>
            <div className="text-xs">
              Which department do most of your clothes come from?
            </div>
            <div className="text-xs">
              We ask because most clothing stores are separated by departments
              as well.
            </div>
          </>
        )}
      </div>

      <div className="my-3">
        <div className={`${flex}`}>
          <div className="font-bold mr-2 ">Age Range</div>
          {!editUserProfile ? (
            <div className="mr-2">{ageRange ? ageRange : defaultLang}</div>
          ) : (
            <div className={`${flex}`}>
              {ageRangeChoices.map((item) => (
                <div className={`${flex} mr-4`} key={item}>
                  <input
                    type="radio"
                    className="mr-1"
                    value={item}
                    checked={ageRange == item}
                    onChange={() => setAgeRange(item)}
                  ></input>
                  <label>{item == "" ? defaultLang : item}</label>
                </div>
              ))}
            </div>
          )}
        </div>
        {editUserProfile && (
          <div className="text-xs">
            We ask because each generation has its own style, and it can help
            others of a similar age find style inspo!
          </div>
        )}
      </div>

      <div className="my-2">
        <div className={`${flex}`}>
          <div className="font-bold mr-2 ">Height Range (ft & in)</div>
          {!editUserProfile ? (
            <div className="mr-2">
              {heightRange ? heightRange : defaultLang}
            </div>
          ) : (
            <div className={`${flex}`}>
              {heightRangeChoices.map((item) => (
                <div className={`${flex} mr-4 `} key={item}>
                  <input
                    type="radio"
                    className="mr-1"
                    value={item}
                    checked={heightRange == item}
                    onChange={() => setHeightRange(item)}
                  ></input>
                  <label>{item == "" ? defaultLang : item}</label>
                </div>
              ))}
            </div>
          )}
        </div>
        {editUserProfile && (
          <div className="text-xs">
            We ask because this will help others of a similar height find
            clothing that will fit them.
          </div>
        )}
      </div>

      <div className="my-2">
        <div className={`${flex}`}>
          <div className="font-bold mr-2 ">Weight Range (lbs)</div>
          {!editUserProfile ? (
            <div className="mr-2">
              {weightRange ? weightRange : defaultLang}
            </div>
          ) : (
            <div className={flex}>
              {weightRangeChoices.map((item) => (
                <div className={`${flex} mr-4`} key={item}>
                  <input
                    type="radio"
                    className="mr-1"
                    value={item}
                    checked={weightRange == item}
                    onChange={() => setWeightRange(item)}
                  ></input>
                  <label>{item == "" ? defaultLang : item}</label>
                </div>
              ))}
            </div>
          )}
        </div>
        {editUserProfile && (
          <div className="text-xs">
            We ask because this can help others of a similar weight find
            clothing that will fit them.
          </div>
        )}
      </div>

      {submitError && (
        <div className="bg-red-500 p-1 my-2 text-white rounded">
          Oh no! We apologize, it looks like we are having server issues. Please
          refresh the page and try again.
        </div>
      )}

      {!editUserProfile ? (
        <button
          className="inverseButton"
          onClick={(e) => {
            e.preventDefault();
            setEditUserProfile(true);
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
              setEditUserProfile(false);

              let data: UserProfile = {
                department: department ? department : "",
                age_range: ageRange ? ageRange : "",
                weight_range: weightRange ? weightRange : "",
                height_range: heightRange ? heightRange : "",
              };

              const resp = await PostUserProfile(
                props.clientServer,
                props.cookie,
                data
              );
              if (resp instanceof Error) {
                setDepartment(props.user?.user_profile?.department);
                setAgeRange(props.user?.user_profile?.age_range);
                setHeightRange(props.user?.user_profile?.height_range);
                setWeightRange(props.user?.user_profile?.weight_range);
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
              setDepartment(props.user?.user_profile?.department);
              setAgeRange(props.user?.user_profile?.age_range);
              setHeightRange(props.user?.user_profile?.height_range);
              setWeightRange(props.user?.user_profile?.weight_range);
              setEditUserProfile(false);
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

const defaultLang = "prefer not to disclose";

const genderChoices = ["women", "men", "unisex", ""];

const ageRangeChoices = [
  "16-20",
  "21-25",
  "26-30",
  "31-35",
  "36-40",
  "41-50",
  "51-60",
  "60-70",
  "",
];

const weightRangeChoices = [
  "80-100",
  "101-115",
  "116-130",
  "131-145",
  "146-160",
  "161-175",
  "176-200",
  "201-225",
  "226-250",
  "250-300",
  "",
];

const heightRangeChoices = [
  "4'6-4'11",
  "5'-5'3",
  "5'4-5'7",
  "5'8-5'11",
  "6'-6'3",
  "6'4-6'7",
  "6'7-7'",
  "",
];
