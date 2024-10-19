import authenticate from "@/app/auth";
import UserForm from "@/components/user/UserForm";
import { User } from "@/components/user/types";
import { usersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const generateMetadata = async ({ params }: { params: { user_id: string } }): Promise<Metadata> => {
  const user = (await usersCollection.findOne({ _id: new ObjectId(params.user_id) })) as User;
  return {
    title: `${user.user_name} | User`,
  };
};

const page = async ({ params }: { params: { user_id: string } }) => {
  const getUserById = async () => {
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

  const user = await getUserById();

  return <UserForm user={user} handleDeleteUser={handleDeleteUser} handleFormSubmit={handleFormSubmit} />;
};

export default authenticate(page);
