import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ✅ universal error handler
const handleError = (error) => {
  return new Error(
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.msg ||
    error?.message ||
    "Something went wrong"
  );
};

const login = async (email, password) => {
  try {
    console.log("📤 Sending login:", { email, password });

    const response = await axiosInstance.post(
      API_PATHS.AUTH.LOGIN,
      {
        email,
        password,
      }
    );

    console.log("✅ Login response:", response.data);

    // ✅ Safety check (VERY IMPORTANT)
    if (!response.data?.token || !response.data?.user) {
      throw new Error("Invalid server response");
    }
    
    // ✅ SAVE TOKEN
    localStorage.setItem("token", response.data.token);
    
    // ✅ SAVE USER
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
    
    return response.data;
  } catch (error) {
    console.log("❌ Login error:", error.response?.data || error.message);

    throw new Error(
      error?.response?.data?.error ||   // ✅ your backend uses "error"
      error?.response?.data?.message ||
      error?.message ||
      "Login failed"
    );
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;