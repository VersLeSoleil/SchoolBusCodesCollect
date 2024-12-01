// src/stores/apiBase.js
import { defineStore } from 'pinia';

export const useApiBaseStore = defineStore('apiBase', {
    state: () => ({
        baseUrl: 'http://121.199.79.24:5793',
        localBaseUrl: 'http://localhost:8888',
        deployedBaseUrl: 'http://121.199.79.24:5793',
    }),
    actions: {
        switchToLocal() {
            this.baseUrl = this.localBaseUrl;
        },
        switchToDeployed() {
            this.baseUrl = this.deployedBaseUrl;
        },
    },
});
