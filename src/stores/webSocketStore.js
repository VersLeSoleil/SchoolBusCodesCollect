// src/stores/webSocketStore.js
import { defineStore } from 'pinia';

let webSocket = null;
let reconnectAttempts = 0; // 记录重连尝试次数
const maxReconnectAttempts = 100; // 最大重连次数
const reconnectInterval = 3000; // 重连间隔时间（毫秒）

export const useWebSocketStore = defineStore('websocket', {
    state: () => ({
        messages: [], // 存储接收到的 WebSocket 消息
        isConnected: false, // WebSocket 连接状态
    }),

    actions: {
        // 初始化 WebSocket 连接
        initWebSocket(url = "ws://localhost:8888/ws") {
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                return; // 如果 WebSocket 已经连接并且是打开状态，直接返回现有连接
            }

            // 创建新的 WebSocket 连接
            webSocket = new WebSocket(url);

            // 连接成功时
            webSocket.onopen = () => {
                this.isConnected = true;
                reconnectAttempts = 0; // 重连成功后重置重连次数
                console.log("WebSocket 已连接");
            };

            // 接收消息时
            webSocket.onmessage = (event) => {
                console.log("收到消息:", event.data);
                this.addMessage(event.data); // 将收到的消息添加到消息列表中
            };

            // 连接错误时
            webSocket.onerror = (error) => {
                console.error("WebSocket 错误:", error);
            };

            // 连接关闭时
            webSocket.onclose = () => {
                console.log("WebSocket 已关闭");
                this.isConnected = false;

                // 如果未达到最大重连次数，尝试重连
                if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})`);
                    setTimeout(() => {
                        this.initWebSocket(url); // 尝试重新连接
                    }, reconnectInterval);
                } else {
                    console.error("达到最大重连次数，无法重新连接");
                    webSocket = null; // 达到最大重连次数后清理实例
                }
            };
        },

        // 发送消息到 WebSocket
        sendMessage(message) {
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(message);
                console.log("已发送消息:", message);
            } else {
                console.error("WebSocket 未连接，无法发送消息");
            }
        },

        // 将接收到的消息添加到消息列表
        addMessage(message) {
            this.messages.push(message);
        },

        // 清空消息列表
        clearMessages() {
            this.messages = [];
        },

        // 关闭 WebSocket 连接
        closeWebSocket() {
            if (webSocket) {
                webSocket.close();
                console.log("WebSocket 已关闭");
                this.isConnected = false;
                webSocket = null;
            }
        },

        // 强制重连 WebSocket
        forceReconnect() {
            if (webSocket) {
                webSocket.close();  // 关闭现有连接
                console.log("强制关闭 WebSocket 连接");
            }
            this.initWebSocket();  // 重新初始化连接
        },
    },
});
