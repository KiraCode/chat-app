import { SignIn } from "@clerk/clerk-react";
import React from "react";

const Login = () => {
  return (
    <div className="flex flex-grow items-center justify-center h-screen">
      <SignIn signUpUrl="/register" forceRedirectUrl={"/main"} />
    </div>
  );
};

export default Login;
