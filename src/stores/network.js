// src/stores/apiBase.js
import { defineStore } from 'pinia';

export const useApiBaseStore = defineStore('apiBase', {
    state: () => ({
        // baseUrl: 'https://121.199.79.24:5793',
        localBaseUrl: 'https://localhost:8888',
        // deployedBaseUrl: 'https://121.199.79.24:5793',
        deployedBaseUrl: 'https://sysuschoolbus.top:5793',
        webLocalBaseUrl: 'wss://localhost:8888/ws',
        webDeployedBaseUrl: 'wss://sysuschoolbus.top:5793/ws',
    }),
});
