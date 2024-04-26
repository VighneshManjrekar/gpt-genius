import { UserProfile } from "@clerk/nextjs";
import { fetchUserTokensById } from "../../../utils/action";
import { auth } from "@clerk/nextjs/server";

const ProfilePage = async () => {
  const { userId } = auth();
  console.log("userId profile",userId)
  const tokens = await fetchUserTokensById(userId);
  return (
    <div>
      <h2 className="mb-8 ml-8 text-xl font-extrabold">
        Token Amount: {tokens}
      </h2>
      <UserProfile />
    </div>
  );
};

export default ProfilePage;
