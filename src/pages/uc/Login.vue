<template>
  <div class="login_form">
    <div class="login_right">
      <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
        <div class="login_title">{{$t('uc.login.login')}}</div>
        <FormItem prop="user">
          <Input name="user" type="text" v-model="formInline.user" :placeholder="$t('uc.login.account')" class="user">
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input type="password" v-model="formInline.password" :placeholder="$t('uc.login.pwdtip')" @on-keyup="onKeyup">
          </Input>
        </FormItem>
        <!--<FormItem class="code" prop="code">
          <tr>
            <td>
              <Input type="text" v-model="formInline.code" :placeholder="$t('uc.login.verificationcode')"></Input>
            </td>
            <td>
              <div class="image" @click="refreshCode" >
                <img id="imgCode" src="http://ipex.openserver.cn/uc/getKaptchaImage" style="float: bottom">
              </div>
            </td>
          </tr>
        </FormItem>-->
        <p id="notice" class="hide">{{$t('uc.login.validatemsg')}}</p>
        <p style="height:30px;">
          <router-link to="/findPwd" style="color:#979797;float:right;padding-right:10px;font-size:12px;">
            {{$t('uc.login.forget')}}
          </router-link>
        </p>
        <FormItem style="margin-bottom:15px;">
          <Button class="login_btn" @click="handleSubmit('formInline')">{{$t('uc.login.login')}}</Button>
        </FormItem>
        <div class='to_register'>
          <span>没有账号</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </Form>
    </div>
      <div>
          <el-dialog title="安全验证" :visible.sync="dialogVisible">
              <el-form :model="form">
                  <el-form-item label-width="120px">
                      <el-input v-model="formInline.emailCode" :placeholder="$t('uc.login.emailcode')" autocomplete="off">
                          <el-button slot="append" class="el-button-tip">
                              <span v-if="this.formInline.count !== 0">{{ formInline.count }}s 后获取验证码</span>
                              <span v-else v-show="this.formInline.count === 0" @click="sendEmailCode(formInline.user)">{{$t('uc.regist.sendcode')}}</span>
                          </el-button>
                      </el-input>
                  </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                  <el-button @click="close">{{$t('uc.login.cancel')}}</el-button>
                  <el-button type="primary" @click="login">{{$t('uc.login.confirm')}}</el-button>
              </div>
          </el-dialog>
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
    height: 760px;
    position: relative;
    overflow: hidden;
    .login_right {
      padding: 20px 30px 20px 30px;
      position: absolute;
      background: #17212e;
      width: 350px;
      height: 400px;
      left: 50%;
      top: 50%;
      margin-left: -175px;
      margin-top: -165px;
      border-top: 4px solid #f0ac19;
      border-radius: 5px;
      form.ivu-form.ivu-form-label-right.ivu-form-inline {
        .login_title{
          height: 70px;
          color: #fff;
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
      refreshCode() {
        let obj = document.getElementById('imgCode');
        obj.src = this.host + '/uc/getKaptchaImage';
      },
      init() {
        if (this.isLogin) {
          this.$router.push("/");
        } else {
          this.initGtCaptcha();
        }
      },
      onKeyup(ev) {
        if (ev.keyCode == 13) {
          $(".login_btn").click();
        }
      },
      initGtCaptcha() {
        var that = this;
        this.$http.get(this.host + this.api.uc.captcha).then(function (res) {
          window.initGeetest(
                  {
                    // 以下配置参数来自服务端 SDK
                    gt: res.body.gt,
                    challenge: res.body.challenge,
                    offline: !res.body.success, //表示用户后台检测极验服务器是否宕机
                    new_captcha: res.body.new_captcha, //用于宕机时表示是新验证码的宕机
                    product: "bind",
                    width: "100%"
                  },
                  this.handler
          );
        });
      },
      handler(captchaObj) {
        captchaObj.onReady(() => {
          $("#wait").hide();
        }).onSuccess(() => {
          // result存的是调用后台图片验证码的结果
          let result = (this._captchaResult = captchaObj.getValidate());
          if (!result) {
            this.$Message.error("请完成验证");
          } else {
            this.handleSubmit("formInline");
          }
        });
        $(".login_btn").click(() => {
          let regPhone = /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
                  regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
                  account = this.formInline.user,
                  flagAccount = regPhone.test(account) || regEmail.test(account),
                  flagPassword = this.formInline.password.length >= 6 ? true : false;
          console.log('captchaObj',captchaObj);
            console.log('captchaObjverify()',captchaObj.verify());
          flagAccount && flagPassword && captchaObj && captchaObj.verify();
          (!flagAccount || !flagPassword) && this.$Message.error("请填写完整的信息");
        });
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
      handleSubmit(name) {
        var result = this._captchaResult;
        if (!result) {
          $("#notice").show();
          setTimeout(function () {
            $("#notice").hide();
          }, 2000);
        } else {
          this.$refs[name].validate(valid => {
            if (valid) {
              var params = {};
              params['username'] = this.formInline.user;
              params['password'] = this.formInline.password;
              // this.$http.post(this.host + this.api.uc.login, params).then(response => {
                // 邮箱发送请求校验用户名和手机号
                    this.$http.post(this.host + this.api.uc.check, params).then(response => {
                        let resp = response.data;
                        // 若校验成功，则发出邮箱验证码的请求，并弹出弹出框
                        if (resp.code === 0) {
                            // 展示弹出框
                            this.dialogVisible = true;
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
                                }, 1000)
                            }
                            // 发送验证码
                            this.sendEmailCode(resp.message);
                        } else {
                            this.$Message.error(resp.message);
                        }
                    });
                }
            //     if (valid) {
            //       var params = {};
            //       params["username"] = this.formInline.user;
            //       params["password"] = this.formInline.password;
            //       this.$http.post(this.host + this.api.uc.login, params).then(response => {
            //         let resp = response.data;
            //         if (resp.code === 0) {
            //           this.$Message.success(this.$t("uc.login.success"));
            //           this.$store.commit("setMember", resp.data);
            //           if (this.$route.query.key != null && this.$route.query.key !== "") {
            //             localStorage.setItem("USERKEY", this.$route.query.key);
            //           }
            //           this.$router.push("/");
            //         } else {
            //           this.$Message.error(resp.message);
            //         }
            //       });
            //     } else {
            //
            //     }
            //   });
            // }
          });
        }
      }
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
