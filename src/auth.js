import axios from "axios";

// 定义一个函数，用于验证 jwtToken 的合法性
export async function validateToken() {
  const token = localStorage.getItem("jwtToken"); // 从 localStorage 获取 jwtToken
  if (!token) {
    return {
      valid: false,
      message: "令牌不存在，请重新登录。"
    };
  }

  try {
    const prefixURL = localStorage.getItem("prefixURL"); // 使用本地存的url
    console.log(prefixURL);
    const response = await axios.post(prefixURL + "/api/validateToken", {}, {
      headers: {
        Authorization: token
      }
    });

    if (response.status === 200) {
      const role = parseInt(response.data.role); // 从后端响应中提取角色

      return {
        valid: true,
        message: "令牌合法",
        role: role
      };
    } else {
      return {
        valid: false,
        message: "令牌无效，请重新登录。"
      };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return {
        valid: false,
        message: "令牌无效或已过期，请重新登录。"
      };
    }
    console.error("令牌验证失败:", error);
    return {
      valid: false,
      message: "令牌验证失败，请稍后重试。"
    };
  }
}

export function getUserIDFromToken(token) {
  try {
      const payload = token.split(".")[1]; // 获取 JWT 的 payload 部分
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/")); // Base64URL 解码
      const payloadObj = JSON.parse(decoded);
      console.log(payloadObj.sub)
      return payloadObj.sub; // 返回 userID
  } catch (error) {
      console.error("解析 JWT 失败:", error);
      return null;
  }
}