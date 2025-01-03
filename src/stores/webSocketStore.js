import { defineStore } from 'pinia';

let webSocket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 100;
const reconnectInterval = 3000;
let broadcastChannel = null; // 定义 BroadcastChannel

export const useWebSocketStore = defineStore('websocket', {
    state: () => ({
        messages: [], // 通用消息队列（如果需要）
        driverGpsMessages: [], // 存储驾驶员GPS消息队列
        paymentUserCountMessages: [], // 存储付款人数消息队列
        vehicleCallMessages: [], // 存储车辆呼叫消息队列
        isConnected: false, // WebSocket 连接状态
        sendQueue: [], // 待发送消息队列（可选）
    }),

    actions: {
        // 初始化 BroadcastChannel
        initBroadcastChannel() {
            if (!broadcastChannel) {
                broadcastChannel = new BroadcastChannel('websocket_channel');
                broadcastChannel.onmessage = (msgEvent) => {
                    console.log("收到来自 BroadcastChannel 的消息:", msgEvent.data);
                };
            }
        },

        // 关闭 BroadcastChannel
        closeBroadcastChannel() {
            if (broadcastChannel) {
                broadcastChannel.close();
                broadcastChannel = null;
            }
        },

        // 初始化 WebSocket 连接
        initWebSocket(url = "wss://localhost:8888/ws") {
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                return; // 已连接，直接返回
            }
            if (!webSocket) {
                webSocket = new WebSocket(url);

                // 连接成功
                webSocket.onopen = () => {
                    this.isConnected = true;
                    reconnectAttempts = 0;
                    console.log("WebSocket 已连接");
                    console.log(url);
                    // 发送待发送队列中的消息
                    this.flushSendQueue();
                };

                // 接收消息
                webSocket.onmessage = (event) => {
                    let messages;
                    try {
                        messages = JSON.parse(event.data);
                    } catch (error) {
                        console.error("消息解析失败", error);
                        return;
                    }

                    if (Array.isArray(messages)) {
                        messages.forEach((message) => this.handleMessage(message));
                    } else {
                        this.handleMessage(messages);
                    }

                    // 使用共享的 BroadcastChannel
                    if (broadcastChannel) {
                        broadcastChannel.postMessage(messages);
                    }
                };

                // 连接错误
                webSocket.onerror = (error) => {
                    console.error("WebSocket 错误:", error);
                };

                // 连接关闭
                webSocket.onclose = () => {
                    console.log("WebSocket 已关闭");
                    this.isConnected = false;

                    // 尝试重连
                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++;
                        console.log(`尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})`);
                        setTimeout(() => {
                            this.initWebSocket(url);
                        }, reconnectInterval);
                    } else {
                        console.error("达到最大重连次数，无法重新连接");
                        webSocket = null; // 清理实例
                        this.closeBroadcastChannel(); // 关闭 BroadcastChannel
                    }
                };
            }

            // 初始化 BroadcastChannel
            // this.initBroadcastChannel();
        },

        // 处理单条消息
        handleMessage(message) {
            switch (message.type) {
                case 'driver_gps':
                    console.log(`接收到驾驶员GPS定位：驾驶员ID：${message.id}，位置：${message.location.latitude}, ${message.location.longitude}`);
                    this.addDriverGpsMessage(message);
                    break;
                case 'call_accept':
                    console.log('接收到呼叫接受消息');
                    this.addMessage(message);
                    break;
                case 'payment_user_count':
                    console.log(`当前付款人数：${message.count}`);
                    this.addMessage(message);
                    break;
                case 'boardingMessage':
                    console.log(`当前上车人数：${message.boardingCount}`);
                    this.addMessage(message);
                    break;
                case 'alightingMessage':
                    console.log(`当前下车人数：${message.alightingCount}`);
                    this.addMessage(message);
                    break;
                case 'vehicle_call':
                    console.log(`接收到车辆呼叫：从 ${message.from.latitude}, ${message.from.longitude} 到 ${message.to.latitude}, ${message.to.longitude}`);
                    this.addVehicleCallMessage(message);
                    break;
                case 'site':
                    console.log(`站點信息${message.sites}`);
                    this.addMessage(message);
                    break;
                case 'route':
                    console.log(`路綫信息${message.routes}`);
                    this.addMessage(message);
                    break;
                default:
                    console.error('未知消息类型', message.type);
                    break;
            }
        },

        // 发送消息到 WebSocket
        sendMessage(message) {
            // const messageString = JSON.stringify(message);
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(message);
                console.log("已发送消息:", message);
            } else {
                console.error("WebSocket 未连接，无法发送消息");
                // 将消息加入待发送队列
                this.sendQueue.push(message);
            }
        },

        // 发送待发送队列中的消息
        flushSendQueue() {
            while (this.sendQueue.length > 0 && webSocket && webSocket.readyState === WebSocket.OPEN) {
                const msg = this.sendQueue.shift();
                webSocket.send(msg);
                console.log("已发送待发送队列中的消息:", JSON.parse(msg));
            }
        },

        addMessage(message) {
            this.messages.push(message);
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
        },

        // 清空所有消息队列
        clearAllMessages() {
            this.driverGpsMessages = [];
            this.paymentUserCountMessages = [];
            this.vehicleCallMessages = [];
            this.messages = [];
        },

        clearDriverGpsMessages() {
            this.driverGpsMessages = [];
        },

        // 关闭 WebSocket 连接
        closeWebSocket() {
            if (webSocket) {
                webSocket.close();
                console.log("WebSocket 已关闭");
                this.isConnected = false;
                webSocket = null;
            }
            this.closeBroadcastChannel();
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
