import React from "react";
import LoginView from "./LoginViewController";
import useLogin from "./useLogin";

const Login = () => {
    const props = useLogin();
    return <LoginView {...props} />;
};

export default Login;
