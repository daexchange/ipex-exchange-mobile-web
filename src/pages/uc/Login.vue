<template>
  <div class="login_form">
    <div class="login_right">
        <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
            <h1 class="login_title">{{$t('uc.login.login')}}</h1>
            <FormItem prop="user">
                <Input type="text" v-model="formInline.user" :placeholder="$t('uc.login.account')" style="width: 295px">
                    <Icon type="ios-person-outline" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem prop="password">
                <Input type="password" v-model="formInline.password" :placeholder="$t('uc.login.pwdtip')" @on-keyup="onKeyup" style="width: 295px">
                    <Icon type="ios-lock-outline" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem prop="emailCode">
                <Input v-model="formInline.emailCode" :placeholder="$t('uc.regist.emailcodetip')" style="width: 295px">
                    <Icon type="md-key" slot="prepend"></Icon>
                    <Button :loading="loading" slot="append" v-if="!loading"
                            v-show="!show" @click="initGtCaptcha(formInline.user)">
                        <span>{{$t('uc.regist.sendcode')}}</span>
                    </Button>
                    <Button :loading="loading" slot="append" v-else v-show="!show">
                        <span>{{$t('uc.regist.sendingcode')}}</span>
                    </Button>
                    <Button :loading="loading" slot="append" v-show="show">
                        <span>{{ count }}s 后获取验证码</span>
                    </Button>
                </Input>
            </FormItem>
            <p style="height:30px;">
                <router-link to="/findPwd" style="color:#979797;float:right;padding-right:10px;font-size:12px;">
                    {{$t('uc.login.forget')}}
                </router-link>
            </p>
            <FormItem class="form_submit">
                <Button type="primary" @click="handleSubmit('formInline')" style="width: 295px">
                    <span style="font-size: 16px">{{$t('uc.login.login')}}</span>
                </Button>
            </FormItem>
            <div class='to_register'>
                <span>没有账号</span>
                <router-link to="/register">立即注册</router-link>
            </div>
        </Form>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .code /deep/ .ivu-input {
    width: 100%;
  }
  /* 验证码 */
  .login_form {
    background: #0b1520 url(../../assets/images/login_bg.jpg) no-repeat center center;
    height: 480px;
    position: relative;
    overflow: hidden;
    .login_right {
      padding: 20px 30px 20px 30px;
      position: absolute;
      background: #17212e;
      width: 350px;
      height: 500px;
      left: 50%;
      top: 50%;
      margin-left: -175px;
      margin-top: -165px;
      /*border-top: 4px solid #f0ac19;*/
      border-radius: 5px;
      form.ivu-form.ivu-form-label-right.ivu-form-inline {
        .login_title{
          /*height: 70px;
          color: #fff;*/
            text-align: center;
            margin: 5px 10px 20px 10px;
        }
        .ivu-form-item {
          .ivu-form-item-content {
            .login_btn.ivu-btn {
              width: 100%;
              background-color: #f0ac19;
              outline: none;
              border-color: #f0ac19;
              color: #fff;
              font-size: 18px;
              border-radius: 30px;
              &:focus {
                -moz-box-shadow: 0px 0px 0px #fff, 0px 0px 0px #fff;
                -webkit-box-shadow: 0px 0px 0px #fff, 0px 0px 0px #fff;
                box-shadow: 0px 0px 0px #fff, 0px 0px 0px #fff;
              }
            }
          }
        }
      }
    }
    .to_register {
       /* padding: 0px 5px 0px 5px;*/
      overflow: hidden;
      font-size: 12px;
      span {
        float: left;
      }
      a {
        float: right;
        color: #f0ac19;
      }
    }
  }
  #captcha {
    width: 100%;
    display: inline-block;
  }
  .show {
    display: block;
  }
  .hide {
    display: none;
  }
  #notice {
    color: red;
  }
  #wait {
    text-align: left;
    color: #666;
    margin: 0;
  }
  .geetest_wait_dot geetest_dot_1 {
    color: red;
  }
  .user .ivu-btn,
  .ivu-btn:active,
  .ivu-btn:focus {
    border-color: #d7dde4;
    box-shadow: none;
  }
  /*  */
</style>
<script>
  //import gtInit from "../../assets/js/gt.js";
  import $ from "jquery";
  export default {
    data() {
      return {
          loading: false,
          show: false,
          count: '',
          timer: null,
          dialogVisible: false,
        captchaObj: null,
        _captchaResult: null,
          form: {
              name: '',
              region: '',
              date1: '',
              date2: '',
              delivery: false,
              type: [],
              resource: '',
              desc: ''
          },
        formInline: {
            user: "",
            password: "",
            code: "",
            emailCode: "",
            count: "",
            timer: ""
        },
        ruleInline: {
          user: [
            {
              required: true,
              message: this.$t("uc.login.accountValidate"),
              trigger: "blur"
            }
          ],
          password: [
            {
              required: true,
              message: this.$t("uc.login.pwdvalidate1"),
              trigger: "blur"
            },
            {
              type: "string",
              min: 6,
              message: this.$t("uc.login.pwdvalidate2"),
              trigger: "blur"
            }
          ],
            emailCode: [
                {
                    required: true,
                    message: this.$t("uc.login.verificationcode"),
                    trigger: "blur"
                },
                {
                    type: "string",
                    min: 6,
                    max: 6,
                    message: this.$t("uc.login.verificationcode1"),
                    trigger: "blur"
                }
            ]
        }
      };
    },
    created: function() {
      this.init();
    },
    computed: {
      isLogin: function() {
        return this.$store.getters.isLogin;
      }
    },
    methods: {
        initGtCaptcha(name) {
            let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
            this.title = '请输入正确的邮箱地址';
            if (!reg.test(name)) {
                this.errorMsg(this.title);
                return;
            }
            // 直接生成一个验证码对象
            let self = this;
            let captcha1 = new TencentCaptcha("2040846200", function (res) {
                res.ret == 0 &&
                (self.isRegister = true) &&
                (self.ticket = res.ticket) &&
                (self.randStr = res.randstr) &&
                self.success();
            });
            captcha1.show(); // 显示验证码
        },
        success() {
            console.log(123456)
            this.getVerificationCode();
        },
        getVerificationCode() {
            //this.initGtCaptcha();
            let params = {};
            let api = "/uc/email/login/code";
            this.loading = true;
            params["email"] = this.formInline.user;
            this.$http.post(this.host + api, params).then(response => {
                let status = response.data;
                if (status.code !== 0) {
                    this.$Message.error(status.message);
                    this.loading = false;
                    this.show = false;
                } else {
                    //alert('发送成功！请前往邮箱查看')
                    this.$Message.success(status.message);
                    //生成发送验证码后的60秒倒计时
                    const TIME_COUNT = 60;
                    if (!this.timer) {
                        this.count = TIME_COUNT;
                        this.loading = false;
                        this.show = true;
                        this.timer = setInterval(() => {
                            if (this.count > 0 && this.count <= TIME_COUNT) {
                                this.count--;
                            } else {
                                this.show = false;
                                clearInterval(this.timer);
                                this.timer = null;
                            }
                        }, 1000)
                    }
                }
                //alert("发送成功！请前往邮箱查看")
            })
        },
        handleSubmit(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.login();
                }
            });
        },
      refreshCode() {
        let obj = document.getElementById('imgCode');
        obj.src = this.host + '/uc/getKaptchaImage';
      },
      init() {
        if (this.isLogin) {
          this.$router.push("/");
        } else {
        }
      },
      onKeyup(ev) {
        if (ev.keyCode == 13) {
          $(".login_btn").click();
        }
      },
      logout() {
        this.$http.post(this.host + "/uc/logout", {}).then(response => {
          var resp = response.body;
          if (resp.code === 0) {
            localStorage.setItem("MEMBER", JSON.stringify(null));
            localStorage.setItem("TOKEN", null);
            localStorage.removeItem("USERKEY", null);
          } else {
            this.$Message.error(resp.message);
          }
        });
      },
      sendEmailCode(email) {
        let api = "/uc/email/login/code";
        var params = {};
        params['email'] = email;
        this.$http.post(this.host + api, params).then(response => {
            //  设置时间锁，控制是否展示发送验证码的倒计时或发送验证码
            const TIME_COUNT = 60;
            if (!this.formInline.timer) {
                this.formInline.count = TIME_COUNT;
                this.formInline.timer = setInterval(() => {
                    if (this.formInline.count > 0 && this.formInline.count <= TIME_COUNT) {
                        this.formInline.count--;
                    } else {
                        clearInterval(this.formInline.timer);
                        this.formInline.timer = null;
                    }
                }, 1000)}
          let resp = response.data;
          if (resp.code === 0) {
            this.$Message.success(resp.message);
          } else {
            this.$Message.error(resp.message);
          }
        });
      },
      login() {
        var param = {};
        var params = {};
        params['username'] = this.formInline.user;
        params['password'] = this.formInline.password;
        params['emailCode'] = this.formInline.emailCode;
        param['email'] = this.formInline.user;
        this.$http.post(this.host + this.api.uc.login, params).then(response => {
          let resp = response.data;
          if (resp.code === 0) {
              // 登录成功之后，发送登录成功的邮件
              let api = "/uc/email/login/success/code";
              this.$http.post(this.host + api, param).then((response) =>{
                  let resp = response.data;
                  if (resp.code === 0) {
                      this.$Message.success(this.$t("uc.login.success"));
                  } else {
                      this.$Message.error(resp.message);
                  }
              });
            this.$Message.success(this.$t("uc.login.success"));
            this.$store.commit("setMember", resp.data);
            if (this.$route.query.key != null && this.$route.query.key !== "") {
              localStorage.setItem("USERKEY", this.$route.query.key);
            }
            this.$router.push("/");
          } else {
            this.$Message.error(resp.message);
          }
        })
      },
        close() {
            this.dialogVisible = false;
        },
    }
  }
</script>
<style lang="scss">
  .login_form {
    .login_right {
      form.ivu-form.ivu-form-label-right.ivu-form-inline {
        .ivu-form-item {
          .ivu-form-item-content {
            .ivu-input-wrapper.ivu-input-type {
              .ivu-input {
                background-color:transparent;
                font-size: 14px;
                border: none;
                border-bottom: 1px solid #27313e;
                border-radius:0;
                &:focus {
                  border: none;
                  border-bottom: 1px solid #27313e;
                  -moz-box-shadow: 2px 2px 5px transparent, -2px -2px 4px transparent;
                  -webkit-box-shadow: 2px 2px 5px transparent, -2px -2px 4px transparent;
                  box-shadow: 2px 2px 5px transparent, -2px -2px 4px transparent;
                }
              }
            }
          }
        }
      }
    }
      .el-dialog{
          width: 480px;
      }
      .el-dialog__header{
          padding: 20px;
          box-sizing: border-box;
          height: 48px;
          width: 100%;
          background-color: #263043;
          margin-top: 180px;
      }
      .el-dialog__title{
          font-size: 16px;
          color: #edf4f8;
      }
      .el-dialog__headerbtn{
          position: relative;
          background: #263043;
          border: none;
          float: right;
          font-size: 20px;
          margin-top: -25px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          text-align: center;
          line-height: 36px;
          right: -10px;
      }
      .el-dialog__body{
          background: #1D2635;
          padding: 20px;
      }
      .el-form-item{
          margin-left: -120px;
          margin-top: 22px;
          margin-bottom: 2px;
      }
      .el-input__inner{
          padding: 4px;
          border: 1px solid #27313e;
          color: #fff;
          background-color: #1D2635;
      }
      .el-input__inner:hover{
          content: "";
          border: 1px solid #51575F;
      }
      .el-input-group__append {
          border: 1px solid #27313e;
          background-color: #1D2635;
      }
      .el-input-group__append button.el-button{
          color: #24a0f5;
          transition: all .3s;
          box-sizing: border-box;
          border-radius: 2px;
          position: relative;
          overflow: hidden;
          text-align: center;
          cursor: pointer;
          user-select: none;
          display: inline-block;
      }
      .el-input-group__append button.el-button:hover{
          content: "";
          border: 1px solid #51575F;
      }
      .el-button{
          font-size: 12px;
      }
      .el-button.el-button--default{
          background: #1D2635;
          border: 1px solid #1D2635;
      }
      .el-button.el-button--default:hover{
          content: "";
          border: 1px solid #51575F;
      }
      .el-dialog__footer{
          background: #1D2635;
          padding: 20px;
      }
  }
</style>
