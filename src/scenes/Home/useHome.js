// src/pages/home/useHomeLogic.js

import {
    useState,
    useCallback,
    useMemo,
    useEffect,
} from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks";
import { capitalize } from "../../utils/helpers";

const useHomeLogic = () => {
    const [loading, setLoading] = useState(false);

    const [userData] = useLocalStorage(
        "userData",
        null
    );

    const navigate = useNavigate();

    useEffect(() => {
        if (!userData) return;

        const allow =
            (userData.show_incident ===
                "1" &&
                userData.role === "admin") ||
            userData.role === "kitchen";

        if (!allow) {
            navigate("/room", {
                replace: true,
            });
        }
    }, [userData, navigate]);

    const handleLogout = useCallback(
        (e) => {
            e.preventDefault();

            setLoading(true);

            toast.success("Logged out!");

            setTimeout(() => {
                localStorage.removeItem(
                    "authToken"
                );

                localStorage.removeItem(
                    "userData"
                );

                setLoading(false);

                navigate("/", {
                    replace: true,
                });
            }, 1000);
        },
        [navigate]
    );

    const handleNavigation =
        useCallback(
            (path, state = {}) => {
                navigate(path, {
                    state,
                });
            },
            [navigate]
        );

    const showDining = useMemo(
        () =>
            userData?.show_dining ===
            "1",
        [userData]
    );

    const showIncident = useMemo(
        () =>
            userData?.show_incident ===
                "1" &&
            userData?.role !== "kitchen",
        [userData]
    );

    const isKitchen = useMemo(
        () => userData?.role === "kitchen",
        [userData]
    );

    const userRole = useMemo(() => {
        if (userData?.role === "admin")
            return "Admin";

        return capitalize(
            userData?.role || "guest"
        );
    }, [userData]);

    return {
        loading,
        userRole,
        showDining,
        showIncident,
        isKitchen,
        handleLogout,
        handleNavigation,
    };
};

export default useHomeLogic;
