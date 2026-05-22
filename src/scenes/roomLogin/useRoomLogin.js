import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks";
import { sanitizeInput } from "../../utils/validation";
import OrderServices from "../../services/orderServices";

const useRoomEnterLogic = () => {
  const [formData, setFormData] = useState({ roomNo: "" });
  const [errors] = useState({ roomNo: "" });
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useLocalStorage("userData", null);

  useEffect(() => {
    if (isLoggingOut) return;
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    const fetchRoomList = async () => {
      try {
        const response = await OrderServices.getAllActiveRoomList();

        if (response?.rooms) {
          setUserData((prev) => ({
            ...(prev || {}),
            rooms: response.rooms,
          }));
        }
      } catch (error) {
        toast.error("Room is not fetched. Please try again.");
      }
    };

    fetchRoomList();
  }, [navigate, isLoggingOut]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    const sanitizedValue = sanitizeInput(value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  }, []);

  /**
   * Handle room submit
   */
  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) {
        e.preventDefault();
      }

      const roomNo = formData?.roomNo?.toString()?.trim();

      const rooms = userData?.rooms || [];

      const matchedRoom = rooms.find(
        (room) =>
          room?.name?.toLowerCase()?.trim() === roomNo?.toLowerCase()?.trim(),
      );

      if (matchedRoom) {
        navigate("/order", {
          state: {
            roomNo: matchedRoom.name,
          },
        });
      } else {
        toast.error("Room number not found!");
      }
    },
    [formData, userData, navigate],
  );

  /**
   * Handle logout
   */
  const handleLogout = useCallback(() => {
    toast.success("Logged out!");

    setLoading(true);

    setIsLoggingOut(true);

    setTimeout(() => {
      setLoading(false);

      localStorage.removeItem("authToken");

      localStorage.removeItem("userData");

      navigate("/", {
        replace: true,
      });
    }, 1000);
  }, [navigate]);

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleLogout,
  };
};

export default useRoomEnterLogic;
