<template>
    <div class="page-view">
        <drawer width="200px;" :show.sync="drawerVisibility" :placement="popForward" :drawer-style="{'background-color':'rgb(9, 33, 84)', width: '60%', height: '667px'}">

            <div slot="drawer" class="drawerContent">
                <!-- 菜单内容 -->
                <div style="width: 100%; height: 28px">
                    <div @click="toggleMenu" class="closeMenu">✕</div>
                </div>
                <Group>
                    <cell class="group_cell">
                        <div slot="title">
                            <router-link to="/login"><span @click="toggleMenu">登录</span></router-link>
                            <span>丨</span>
                            <router-link to="/register"><span @click="toggleMenu">注册</span></router-link>
                        </div>
                        <Icon type="md-contact" size="42" slot="icon" style="margin-right: 6px"/>
                    </cell>
                    <cell link="/" title="首页" @click.native="toggleMenu" class="group_cell">
                        <Icon type="md-home" size="22" slot="icon" style="margin-right: 6px"/>
                    </cell>
                    <cell link="/exchange" title="币币交易" @click.native="toggleMenu" class="group_cell">
                        <Icon type="logo-bitcoin" size="22" slot="icon" style="margin-right: 6px"/>
                    </cell>
                    <cell link="/otc/trade/ETH" title="法币交易" @click.native="toggleMenu" class="group_cell">
                        <Icon type="ios-desktop" size="22" slot="icon" style="margin-right: 6px"/>
                    </cell>
                </Group>
                <Group gutter="0px" class="group_cell_member">
                    <cell link="/uc/safe" title="个人中心" @click.native="toggleMenu" class="group_cell">
                        <Icon type="md-person" size="22" slot="icon" style="margin-right: 6px"/>
                    </cell>
                </Group>
            </div>

            <!-- rourer-view 作为默认插槽内容 -->
            <div>
                <div class="app-header">
                    <router-link to="/">
                        <div  class="header-logo"></div>
                    </router-link>
                    <div class="login-register-menu">
                        <div class="ifLogin" v-if="!isLogin">
                            <router-link to="/login">
                                <div class="login">登录</div>
                            </router-link>
                            <router-link to="/register">
                                <div class="register">注册</div>
                            </router-link>
                        </div>
                        <div class="ifLogin" v-if="isLogin">
                            <Icon style="margin-bottom: 4px" type="md-person" size="20"/>
                            <div class="showNmae">{{ showUsername(member.username) }}</div>
                        </div>
                        <div class="menu">
                            <img @click="toggleMenu" src="./assets/images/nav_manu.svg" style="height: 20px; width: 20px;text-align: center; vertical-align: middle;">
                        </div>
                    </div>
                </div>
                <router-view></router-view>
            </div>

        </drawer>
    </div>
</template>
<script>
    import { Drawer, Group, Cell, } from 'vux';
    export default {
        components: {
            Drawer,
            Group,
            Cell,
        },
        data() {
            return {
                drawerVisibility: false,  // 侧边栏是否打开
                popForward: 'right',
                username: "",
            }
        },
        watch: {
            activeNav: function() {
                switch (this.activeNav) {
                    case "nav-exchange":
                        break;
                    default:
                        window.document.title = "星际数字加密资产交易平台";
                        break;
                }
            },
        },
        computed: {
            activeNav: function() {
                return this.$store.state.activeNav;
            },
            isLogin: function() {
                return this.$store.getters.isLogin;
            },
            member: function() {
                return this.$store.getters.member;
            },
        },
        mounted() {
            if (!this.isMobile()) {
                window.location.href = "https://ipex.openserver.cn/";
            }
        },
        created: function () {
            this.initialize();
        },
        methods: {
            isMobile() {
                let flag = navigator.userAgent.match(
                    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
                );
                return flag;
            },
            toggleMenu() {
                console.log("我被点了1...");
                this.drawerVisibility = !this.drawerVisibility;
            },
            takeMenu() {
                console.log("我被点了2...")
                if (this.drawerVisibility == true) {
                    this.drawerVisibility = false;
                }
            },
            showUsername(str) {
                let nameStr;
                if (str !== null && str !== '' && str.length > 4) {
                    nameStr = str.slice(0, 4) + "···";
                } else {
                    nameStr = str;
                }
                return nameStr;
            },
            checkLogin() {
                this.$http.post(this.host + "/uc/check/login", {}).then(response => {
                    var result = response.body;
                    if (result.code == 0 && result.data == false) {
                        this.$store.commit("setMember", null);
                    }
                });
            },
            initialize() {
                this.$store.commit("recoveryMember");
                this.checkLogin();
            },
        }
    }
</script>
<style>
    body {
        background: #0b1520;
    }
    .ivu-table:before {
        background-color: transparent;
    }
    .ivu-table:after {
        background-color: transparent;
    }
</style>
<style scoped lang="scss">
    .app-header {
        width: 100%;
        height: 48px;
        background: #27313e;
    }
    .header-logo {
        float: left;
        width: 88px;
        height: 35px;
        margin-top: 5px;
        margin-left: 12px;
        background: url(./assets/images/logo.svg) no-repeat;
        background-size: 100% 100%;
    }
    .login-register-menu {
        float: right;
        margin-right: 15px;
        margin-top: 11px;
        font-size: 16px;
        color: #808695;
    }
    .ifLogin {
        float: left;
        margin-right: 15px;
    }
    .showNmae {
        display: inline;
    }
    .login {
        display: inline;
        margin-right: 5px;
    }
    .register {
        display: inline;
        /*margin-right: 15px;*/
    }
    .menu {
        float: right;
    }
    .closeMenu {
        font-size: 24px;
        color: #7080a3;
        float: right;
        margin: 7px 14px 0px 0px;
    }
    .group_cell {
        font-size: 14px;
        color: #c6e9f8;
        background: rgb(9, 33, 84);
    }
    .weui-cell:before {
        border-top: 0px solid #808695;
    }
    .drawerContent /deep/ .weui-cells:after {
        border-bottom: 4px solid #D9D9D9;
    }
    .group_cell_member /deep/ .weui-cells:after {
        border-bottom: 0px solid #D9D9D9;
    }
</style>
