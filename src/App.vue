<template>
    <div class="page-view">
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
        <!-- 侧边栏 -->
        <my-menu :my-visible.sync = "visible">
            <!-- 这里的按钮可以自己去封装定义 -->
            <!-- <p slot='toggleBtn'>点我点我</p> -->
            <!--<template slot="menu-title">LlLl</template>-->
            <menu-item route='/'>
                <Icon type="md-contact" size="38"/>
                <span style="font-size: 16px; vertical-align: center">登录</span>
                <span style="font-size: 16px; vertical-align: center">|</span>
                <span style="font-size: 16px; vertical-align: center">注册</span>
            </menu-item>
            <menu-item route='/'>
                <Icon type="md-home" size="22"/>
                <span style="font-size: 14px; vertical-align: bottom">首页</span>
            </menu-item>
            <menu-item route='/login'>
                    <Icon type="logo-bitcoin" size="22"/>
                    <span style="font-size: 14px; vertical-align: bottom">币币交易</span>
            </menu-item>
            <menu-item route='/register'>
                <Icon type="md-desktop" size="22"/>
                <span style="font-size: 14px; vertical-align: bottom">法币交易</span>
            </menu-item>
            <menu-item route='/register'>
                <Icon type="md-person" size="22"/>
                <span style="font-size: 14px; vertical-align: bottom">个人中心</span>
            </menu-item>
        </my-menu>
        <router-view></router-view>
    </div>
</template>
<script>
    import MyMenu from "./common/global/sidebar/src/my-menu";
    export default {
        components: {MyMenu},
        data() {
            return {
                visible: false,  // 侧边栏是否打开
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
        created: function () {
            this.initialize();
        },
        methods: {
            toggleMenu() {
                console.log("我被点了....");
                this.visible = true;
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
        /*display: inline;*/
        float: right;
    }
</style>
