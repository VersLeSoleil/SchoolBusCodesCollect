import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            userAccount: '', // 用户帐户
        }
    },
    getters: {
        getUser(state) {
            return state.userAccount;
        },
    },
    actions: {
        setUserAccount(newAccount) {
            this.userAccount = newAccount;
        }
    }
})
