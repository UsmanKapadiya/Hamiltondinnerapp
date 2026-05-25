// src/pages/home/Home.jsx

import React from "react";

import HomeView from "./HomeViewController";
import useHomeLogic from "./useHome";

const Home = () => {
    const props = useHomeLogic();

    return <HomeView {...props} />;
};

export default Home;
