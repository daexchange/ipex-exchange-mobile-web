<template>
    <div class="main_background">
        <Form label-position="top">
            <FormItem>
                <label slot="label">
                    <Icon type="md-person" size="18" style="margin-bottom:3px;color: #ff9900"/>
                    <span style="font-size: 16px;color: white">&nbsp;昵称</span>
                </label>
                <Input style="width: 250px" :readonly="setNick" :value="user.username"></Input>
                <Button type="primary" style="margin-left: 10px">设置</Button>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <Icon type="md-card" size="18" style="margin-bottom:3px;color: #ff9900"/>
                    <span style="font-size: 16px;color: white">&nbsp;实名认证</span>
                </label>
                <Input style="width: 250px" readonly :value="user.realName"></Input>
                <Button type="primary" @click="goAuthentication" style="margin-left: 10px">已绑定</Button>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <Icon type="md-mail" size="18" style="margin-bottom:3px;color: #ff9900"/>
                    <span style="font-size: 16px;color: white">&nbsp;邮箱</span>
                </label>
                <Input style="width: 250px" readonly :value="user.email"></Input>
                <Button type="primary" disabled style="margin-left: 10px">已绑定</Button>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <Icon type="ios-lock" size="20" style="margin-bottom:3px;color: #ff9900"/>
                    <span style="font-size: 16px;color: white">&nbsp;登录密码</span>
                </label>
                <Input style="width: 250px" readonly value="登录平台时使用"></Input>
                <Button type="primary" style="margin-left: 10px">修改</Button>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <Icon type="logo-bitcoin" size="20" style="margin-bottom:3px;color: #ff9900"/>
                    <span style="font-size: 16px;color: white">&nbsp;资金密码</span>
                </label>
                <Input style="width: 250px;" readonly value="账户资金变动时，需先验证资金密码"></Input>
                <Button type="primary" style="margin-left: 10px">修改</Button>
            </FormItem>
        </Form>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                user: {},
                setNick: true,
            }
        },
        created: function() {
          this.init();
        },
        methods: {
            init() {
              this.getMember();
            },
            getMember() {
                //获取个人安全信息
                var self = this;
                this.$http
                    .post(this.host + this.api.uc.securitySetting)
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.user = resp.data;
                            this.usernameS = this.user.username && this.user.username.slice(0,1);
                            this.$store.commit("setMember", resp.data);
                        } else {
                            this.$Message.error(this.loginmsg);
                            // this.$Message.error(this.$t('common.logintip'));
                        }
                    });
            },
            goAuthentication() {
                this.$router.push("/goAuthentication");
            }
        }

    }
</script>

<style scoped>
    .main_background {
        background-color: #192330;
        padding: 25px;
        color: #fff;
    }
</style>
