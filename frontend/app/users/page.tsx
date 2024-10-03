import React from "react";
import authenticate from "../auth";

const page = () => {
  return <div>page</div>;
};

export default authenticate(page);
