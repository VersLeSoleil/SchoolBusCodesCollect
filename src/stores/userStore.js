// src/stores/userStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { getUserIDFromToken } from '@/auth.js';

const token = localStorage.getItem("jwtToken");
if (!token) {
    // ElMessage.error("未找到用户令牌");
}

const userID = getUserIDFromToken(token);
export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: {
            avatar: '',
            name: '',
            student_account: '',
            studentId: '',
            grade: '',
            major: '',
            phone: '',
            user_id: userID,
        },
    }),
    actions: {
        async fetchUserInfo() {
            try {
                const prefixURL = localStorage.getItem("prefixURL") || 'http://localhost:8888';
                const token = localStorage.getItem("jwtToken");
                if (!token) {
                    ElMessage.error("未找到用户令牌");
                    return;
                }
                const userID = getUserIDFromToken(token);
                console.log("store.uid = ",userID);
                if (!userID) {
                    ElMessage.error("无效的用户令牌");
                    return;
                }
                const response = await axios.post(
                    `${prefixURL}/api/getUserAll`,
                    new URLSearchParams({
                        userID,
                    })
                );
                console.log(response.data);
                if (response.data) {
                    this.userInfo.name = response.data.student_name;
                    this.userInfo.student_account = response.data.student_account;
                    this.userInfo.grade = response.data.grade;
                    this.userInfo.major = response.data.major;
                    this.userInfo.studentId = response.data.student_number;
                    this.userInfo.phone = response.data.phone;
                    this.userInfo.avatar = response.data.avatar ? `${prefixURL}${response.data.avatar}` : '';
                    console.log("avatar =",this.userInfo.avatar);
                    this.userInfo.user_id = userID;
                    console.log(response.data);
                } else {
                    ElMessage.error("未找到用户信息");
                }
            } catch (error) {
                console.error("获取用户信息失败:", error);
                ElMessage.error("获取用户信息失败，请稍后重试");
            }
        },
        async updateUserInfo(payload) {
            try {
                const prefixURL = localStorage.getItem("prefixURL") || 'http://localhost:8888';
                const token = localStorage.getItem("jwtToken");
                
                if (!token) {
                    ElMessage.error("未找到用户令牌");
                    return;
                }
                const response = await axios.post(`${prefixURL}/api/updateUser`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.data && response.data.message === "User information updated successfully") {
                    ElMessage.success("用户信息更新成功");
                    await this.fetchUserInfo(); // 重新获取用户信息
                } else {
                    ElMessage.error("更新用户信息失败: " + (response.data.message || "未知错误"));
                }
            } catch (error) {
                console.error("更新用户信息失败:", error);
                ElMessage.error("更新用户信息失败，请稍后重试");
            }
        },
        async uploadAvatar(file) {
            try {
                const prefixURL = localStorage.getItem("prefixURL") || 'http://localhost:8888';
                const token = localStorage.getItem("jwtToken");
                if (!token) {
                    ElMessage.error("未找到用户令牌");
                    return;
                }
                const formData = new FormData();
                formData.append('avatar', file);
                const userID = getUserIDFromToken(token);
                formData.append('userID', userID);

                const response = await axios.post(`${prefixURL}/api/uploadAvatar`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.url) {
                    this.userInfo.avatar = `${prefixURL}${response.data.url}`;
                    ElMessage.success('头像上传成功');
                } else {
                    ElMessage.error('头像上传失败');
                }
            } catch (error) {
                console.error('头像上传错误:', error);
                ElMessage.error('头像上传失败');
            }
        },
    },
});
