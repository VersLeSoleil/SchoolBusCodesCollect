<template>
    <div>
        <button @click="toMycenter" class="myCenter">主页</button>
        <button @click="showBuyTickt" class="buyTicket">购票</button>
        <user_ticket :visible="buyTicketVisible"  @close="closeBTicket" />
        <button @click="showCallBus" class="callBus">叫车</button>
    </div>
</template>

<script setup>
import user_ticket from './user_ticket.vue';
import router from '@/router';
import {reactive} from 'vue';
    let buyTicketVisible=reactive(false);
    function showBuyTickt(){
        buyTicketVisible=true;
    }
    function closeBTicket(){
        console.log(buyTicketVisible);
        buyTicketVisible=false;
        console.log(buyTicketVisible);
    }
    function toMycenter() {
    router.push('/user-person');
    }
</script>

<style scoped>
    .myCenter{
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(113, 65, 168, 0.8);
    color: floralwhite;
    font-size: 14px;
    position: absolute;
    top: 20%;
    left: 20%;
    }
    .buyTicket {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(113, 65, 168, 0.8);
    color: floralwhite;
    font-size: 14px;
    position: absolute;
    top: 80%;
    left: 40%;
}
    .callBus{
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(113, 65, 168, 0.8);
    color: floralwhite;
    font-size: 14px;
    position: absolute;
    top: 80%;
    left: 60%;
    }
</style>