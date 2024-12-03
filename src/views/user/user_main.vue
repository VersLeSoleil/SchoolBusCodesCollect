<template>
    <div>
        <button @click="toMycenter" class="myCenter">主页</button>
        <button v-show="buyButtonVisible" @click="showBuyTickt" class="buyTicket">购票</button>
        <user_ticket :visible="buyTicketVisible"  @close="close" :getTicket="getTicket" />
        <button @click="showCallBus" class="callBus">叫车</button>
        <button @click="showTicket" class="ticket">上车凭证</button>
        <User_proveticket :visible="provideTicketVisible"  @close1="close1" :from="from" :dest="dest" :carid="carid" :buyTime="buyTime"/>
    </div>
</template>

<script setup>
import user_ticket from './user_ticket.vue';
import router from '@/router';
import {ref} from 'vue';
import User_proveticket from './user_proveticket.vue';
    let from=ref("榕园广场");
    let dest=ref("教学楼");
    let carid=ref("粤C11111");
    let buyTime=ref();
    let buyButtonVisible=ref(true);
    let buyTicketVisible=ref(false);
    let provideTicketVisible=ref(false);
    function showBuyTickt(){
        buyTicketVisible.value=true;
    }
    function close(){
        buyTicketVisible.value=false;
    }
    function getTicket(value1, value2, value3) {
        from=value1;
        dest=value2;
        carid=value3;
        buyTime=new Date().toLocaleString();
        buyButtonVisible.value=false;
    }
    function showTicket(){
        provideTicketVisible.value=true;
    }
    function close1(){
        provideTicketVisible.value=false;
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