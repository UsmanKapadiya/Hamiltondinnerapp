// useLoginLogic.js

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AuthServices from "../../services/authServices";
import { useLazyApi } from "../../hooks";
import { validateLoginForm, sanitizeInput } from "../../utils/validation";

const useLoginLogic = () => {
  const [formData, setFormData] = useState({
    roomNo: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleLoginSuccess = useCallback(
    (response) => {
      const {
        authentication_token,
        role,
        user_id,
        show_dining,
        show_incident,
        language,
        guideline,
        guideline_cn,
        room_id,
        rooms,
        form_types,
        user_list,
        breakfast_guideline,
        breakfast_guideline_cn,
        lunch_guideline,
        lunch_guideline_cn,
        dinner_guideline,
        dinner_guideline_cn,
      } = response;

      const langCode = language === 1 ? "cn" : "en";

      const userData = {
        role,
        user_id,
        show_dining,
        show_incident,
        language,
        langCode,
        guideline,
        guideline_cn,
        room_id,
        rooms,
        form_types,
        user_list,
        breakfast_guideline,
        breakfast_guideline_cn,
        lunch_guideline,
        lunch_guideline_cn,
        dinner_guideline,
        dinner_guideline_cn,
      };

      localStorage.setItem("authToken", authentication_token);

      localStorage.setItem("userData", JSON.stringify(userData));

      toast.success(response.ResponseText || "Successfully Login");

      setTimeout(() => {
        if (role === "user") {
          navigate("/order", {
            state: {
              roomNo: formData?.roomNo,
            },
            replace: true,
          });
        } else {
          if (
            (show_incident === "1" && role === "admin") ||
            role === "kitchen"
          ) {
            navigate("/home", {
              replace: true,
            });
          } else {
            navigate("/room", {
              replace: true,
            });
          }
        }
      }, 1000);
    },
    [navigate, formData.roomNo],
  );

  const { execute: loginUser, loading } = useLazyApi(
    ({ roomNo, password }) =>
      AuthServices.login({
        roomNo,
        password,
      }),
    {
      onSuccess: (response) => {
        if (response.ResponseCode === "1") {
          handleLoginSuccess(response);
        } else {
          toast.error(
            response.ResponseText || "Login failed. Please try again.",
          );
        }
      },

      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.ResponseText ||
          "An unexpected error occurred. Please try again.";

        toast.error(errorMessage);
      },
    },
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      const sanitizedValue = sanitizeInput(value);

      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validation = validateLoginForm(formData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});

      await loginUser(formData);
    },
    [formData, loginUser],
  );

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
};

export default useLoginLogic;
