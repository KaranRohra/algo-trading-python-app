import { envCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import authenticate from "../auth";
import Environments from "./Environments";

const page = async () => {
  const environmentVariables = JSON.parse(JSON.stringify(await envCollection.findOne())) || {};
  const _id: string = environmentVariables._id;
  delete environmentVariables._id;

  const saveEnvironmentVariable = async (envVariables: { [key: string]: string }) => {
    "use server";
    await envCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { ...envVariables } });
  };

  const deleteEnvironmentVariable = async (key: string) => {
    "use server";
    await envCollection.updateOne({ _id: new ObjectId(_id) }, { $unset: { [key]: "" } });
  };
  return (
    <Environments
      environmentVariables={environmentVariables}
      saveEnvironmentVariable={saveEnvironmentVariable}
      deleteEnvironmentVariable={deleteEnvironmentVariable}
    />
  );
};

export default authenticate(page);
