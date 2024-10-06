import authenticate from "@/app/auth";
import { usersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import UserForm from "@/components/user/UserForm";
import { User } from "@/components/user/types";

const page = async ({ params }: { params: { user_id: string } }) => {
  const getUserbyId = async () => {
    "use server";
    try {
      const _id = params.user_id;
      const user = (await usersCollection.findOne({
        _id: new ObjectId(_id),
      })) as User;
      delete user._id;
      return JSON.parse(JSON.stringify(user));
    } catch (error) {
      console.error(error);
      redirect("/users");
    }
  };

  const handleFormSubmit = async (user: User) => {
    "use server";
    delete user._id;
    await usersCollection.updateOne({ _id: new ObjectId(params.user_id) }, { $set: user });
  };

  const handleDeleteUser = async () => {
    "use server";
    await usersCollection.deleteOne({ _id: new ObjectId(params.user_id) });
    redirect("/users");
  };

  const user = await getUserbyId();

  return <UserForm user={user} handleDeleteUser={handleDeleteUser} handleFormSubmit={handleFormSubmit} />;
};

export default authenticate(page);
