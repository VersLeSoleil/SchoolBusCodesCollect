import { defineStore } from 'pinia';

let webSocket = null;
let reconnectAttempts = 0; // 记录重连尝试次数
const maxReconnectAttempts = 100; // 最大重连次数
const reconnectInterval = 3000; // 重连间隔时间（毫秒）

export const useWebSocketStore = defineStore('websocket', {
    state: () => ({
        driverGpsMessages: [], // 存储驾驶员GPS消息队列
        paymentUserCountMessages: [], // 存储付款人数消息队列
        vehicleCallMessages: [], // 存储车辆呼叫消息队列
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
                const messages = JSON.parse(event.data); // 假设数据是一个数组
                messages.forEach((message) => {
                    switch (message.type) {
                        case 'driver_gps':
                            console.log(`接收到驾驶员GPS定位：驾驶员ID：${message.id}，位置：${message.location.latitude}, ${message.location.longitude}`);
                            this.addDriverGpsMessage(message);
                            break;
                        case 'payment_user_count':
                            console.log(`当前付款人数：${message.count}`);
                            this.addPaymentUserCountMessage(message);
                            break;
                        case 'vehicle_call':
                            console.log(`接收到车辆呼叫：从 ${message.from.latitude}, ${message.from.longitude} 到 ${message.to.latitude}, ${message.to.longitude}`);
                            this.addVehicleCallMessage(message);
                            break;
                        default:
                            console.error('未知消息类型', message.type);
                            break;
                    }
                });
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

        // 将驾驶员 GPS 消息添加到消息队列
        addDriverGpsMessage(message) {
            this.driverGpsMessages.push(message);
        },

        // 将付款人数消息添加到消息队列
        addPaymentUserCountMessage(message) {
            this.paymentUserCountMessages.push(message);
        },

        // 将车辆呼叫消息添加到消息队列
        addVehicleCallMessage(message) {
            this.vehicleCallMessages.push(message);
            console.log("asfdsd", this.vehicleCallMessages);
        },

        // 清空所有消息队列
        clearAllMessages() {
            this.driverGpsMessages = [];
            this.paymentUserCountMessages = [];
            this.vehicleCallMessages = [];
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

    getters: {
        // 获取所有消息队列
        getDriverGpsMessages(state) {
            return state.driverGpsMessages;
        },

        getPaymentUserCountMessages(state) {
            return state.paymentUserCountMessages;
        },

        getVehicleCallMessages(state) {
            return state.vehicleCallMessages;
        },
    },
});
