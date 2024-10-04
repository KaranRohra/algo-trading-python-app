"use client";

import UserForm from "./UserForm";

const page = ({ params }: { params: { user_id: string } }) => {
  console.log(params.user_id);
  return (
    <div>
      <UserForm />
    </div>
  );
};

export default page;
