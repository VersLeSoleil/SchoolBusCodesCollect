// src/stores/apiBase.js
import { defineStore } from 'pinia';

export const useApiBaseStore = defineStore('apiBase', {
    state: () => ({
        baseUrl: 'http://121.199.79.24:5793',
        localBaseUrl: 'http://localhost:8888',
        deployedBaseUrl: 'http://121.199.79.24:5793',
        webBaseUrl: 'ws://121.199.79.24:5793/ws',
        webLocalBaseUrl: 'ws://localhost:8888/ws',
        webDeployedBaseUrl: 'ws://121.199.79.24:5793/ws',
    }),
    actions: {
        switchToLocal() {
            this.baseUrl = this.localBaseUrl;
            this.webBaseUrl = this.webLocalBaseUrl;
        },
        switchToDeployed() {
            this.baseUrl = this.deployedBaseUrl;
            this.webBaseUrl = this.webDeployedBaseUrl;
        },
    },
});
