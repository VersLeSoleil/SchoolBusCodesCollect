// socket.js
let webSocket = null;

export function initWebSocket() {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
        webSocket = new WebSocket("ws://localhost:8888/ws");

        webSocket.onopen = () => {
            console.log("WebSocket 已连接");
        };

        webSocket.onmessage = (event) => {
            console.log("收到消息:", event.data);
        };

        webSocket.onerror = (error) => {
            console.error("WebSocket 错误:", error);
        };

        webSocket.onclose = () => {
            console.log("WebSocket 已关闭");
            webSocket = null; // 连接关闭后清理实例
        };
    }
    return webSocket;
}

export function getWebSocket() {
    return webSocket;
}
