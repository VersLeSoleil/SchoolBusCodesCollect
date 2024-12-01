import axios from "axios";
import {useApiBaseStore} from "@/stores/network";

// 定义一个函数，用于验证 jwtToken 的合法性
export async function validateToken() {
    const token = localStorage.getItem("jwtToken"); // 从 localStorage 获取 jwtToken
    if (!token) {
      return { valid: false, message: "令牌不存在，请重新登录。" };
    }

    try {
        const apiBaseStore = useApiBaseStore();
      const response = await axios.post(apiBaseStore.baseUrl + "/api/validateToken", {}, {
        headers: {
          Authorization: token
        }
      });

      if (response.status === 200) {
        return { valid: true, message: "令牌合法" };
      } else {
        return { valid: false, message: "令牌无效，请重新登录。" };
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return { valid: false, message: "令牌无效或已过期，请重新登录。" };
      }
      console.error("令牌验证失败:", error);
      return { valid: false, message: "令牌验证失败，请稍后重试。" };
    }
  }
