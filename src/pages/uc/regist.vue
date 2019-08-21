<template>
    <div class="register_form">
        <div class="register_head">
            <h1 style="text-align: center;color: #2c3b59;padding-bottom: 15px">邮箱注册</h1>
            <Form ref="formItem2" :model="formItem2" label-position="top">
                <FormItem :label="$t('uc.regist.email')" prop="email" :rules="email">
                    <!--防止自动填入邮箱地址和密码-->
                    <Input type="password" style="position: absolute;z-index: -999"/>
                    <Input v-model="formItem2.email" :placeholder="$t('uc.regist.emailtip')"
                           @keyup.native="disable()"></Input>
                </FormItem>
                <FormItem :label="$t('uc.regist.emailcode')" prop="emailCode" :rules="emailCode">
                    <!--防止自动填入邮箱地址和密码-->
                    <Input type="password" style="position: absolute;z-index: -999"/>
                    <Input v-model="formItem2.emailCode" @keyup.native="disable()" :placeholder="$t('uc.regist.emailcodetip')">
                        <Button :loading="formItem2.loading" slot="append" v-if="!formItem2.loading"
                                v-show="!formItem2.show" @click="initGtCaptcha(formItem2.email)">
                            <span>{{$t('uc.regist.sendcode')}}</span>
                        </Button>
                        <Button :loading="formItem2.loading" slot="append" v-else v-show="!formItem2.show">
                            <span>{{$t('uc.regist.sendingcode')}}</span>
                        </Button>
                        <Button :loading="formItem2.loading" slot="append" v-show="formItem2.show">
                            <span>{{ formItem2.count }}s 后获取验证码</span>
                        </Button>
                    </Input>
                </FormItem>
                <FormItem :label="$t('uc.regist.pwd')" prop="password" :rules="password">
                    <!--防止自动填入用户名密码-->
                    <Input type="password" style="position: absolute;z-index: -999"/>
                    <Input type="password" v-model="formItem2.password" @keyup.native="disable()"
                           :placeholder="$t('uc.regist.pwdvalidate1')"></Input>
                </FormItem>
                <FormItem class="rePwd_input" :label="$t('uc.regist.confrimpwd')" prop="repassword" :rules="repassword">
                    <!--防止自动填入用户名密码-->
                    <Input type="password" style="position: absolute;z-index: -999"/>
                    <Input type="password" v-model="formItem2.repassword" @keyup.native="disable()"
                           :placeholder="$t('uc.regist.confirmpwdtip')"></Input>
                </FormItem>
                <FormItem class="check-agree">
                    <Checkbox v-model="formItem2.single" @on-change="disable()" @keyup.native="disable()">
                        {{$t('uc.regist.agreement')}}
                    </Checkbox>
                    <a href="#/helpdetail?cate=1&id=1&cateTitle=常见问题" target="_blank" style="">《{{$t('uc.regist.userprotocol')}}》</a>
                </FormItem>
                <FormItem class="form_submit">
                    <Button v-if="formItem2.isOk" type="primary" @click="handleSubmit('formItem2')" long>
                        <span style="font-size: 16px">{{$t('uc.regist.regist')}}</span>
                    </Button>
                    <Button v-else :disabled="!formItem2.isOk" type="primary" long style="background: #808695">
                        <span style="font-size: 16px">{{$t('uc.regist.regist')}}</span>
                    </Button>
                </FormItem>
            </Form>
        </div>
    </div>
</template>

<script>
    export default {
        inject: ['reload'],
        data() {
            const validatePhone = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error(this.$t('uc.regist.teltip')));
                } else if (!/^1[34578]\d{9}$/.test(value)) {
                    callback(this.$t('uc.regist.telerr'));
                } else {
                    callback();
                }
            };
            const validateRepassword = (rule, value, callback) => {
                let tab = this.tab;
                if (value === '') {
                    callback(new Error(this.$t('uc.regist.confirmpwdtip')));
                } else if (tab === 'key1' && value !== this.formItem1.password) {
                    callback(new Error(this.$t('uc.regist.confirmpwderr')));
                } else if (tab === 'key2' && value !== this.formItem2.password) {
                    callback(new Error(this.$t('uc.regist.confirmpwderr')));
                } else {
                    callback();
                }
            };
            return {
                label2: (h) => {
                    return h('div', [h('span', {style: {fontSize: '20px'}}, this.$t('uc.regist.emailregist'))])
                },
                tab: 'key2',
                formItem2: {
                    isOk: false,
                    country: null,
                    email: '',
                    emailCode: '',
                    loading: false,
                    show: false,
                    username: '',
                    password: '',
                    repassword: '',
                    single: false,
                    count: '',
                    timer: null
                },
                captchaObj: null,
                _captchaResult: null,
                // ruleItem: {
                //     country: [
                //         { required: true, message: this.$t('uc.regist.countrytip')/*this.$t("uc.regist.countrytip")*/, trigger: 'change' }
                //     ],
                //     phoneNumber: [
                //         //{ required: true, message: '请输入手机号码'/*this.$t("uc.regist.teltip")*/, trigger: 'blur' },
                //         { required: true, validator: validatePhone, trigger: 'blur' }
                //     ],
                //     noteCode: [
                //         { required: true, message: this.$t('uc.regist.smscodetip'), trigger: 'blur' }
                //     ],
                email: [
                    {
                        required: true,
                        message: this.$t('uc.regist.emailtip')/*this.$t("uc.regist.teltip")*/,
                        trigger: 'blur'
                    },
                    {type: 'email', message: this.$t('uc.regist.emailerr'), trigger: 'blur'}
                ],
                emailCode: [
                    {required: true, message: this.$t('uc.regist.emailcodetip'), trigger: 'blur'}
                ],
                // username: [
                //     { required: true, message: this.$t('uc.regist.usernametip'), trigger: 'blur' },
                //     { type: 'string', min: 3, max: 15, message: this.$t('uc.regist.usernamemsg'), trigger: 'blur' }
                // ],
                password: [
                    {required: true, message: this.$t('uc.regist.pwdtip'), trigger: 'blur'},
                    {type: 'string', min: 6, message: this.$t('uc.regist.pwdmsg'), trigger: 'blur'}
                ],
                repassword: [
                    {required: true, message: this.$t('uc.regist.confirmpwdtip'), trigger: 'blur'},
                    {validator: validateRepassword, trigger: 'blur'}
                ],
                // },
                isRegister: '',
                ticket: '',
                randStr: '',
                title: '',
                content: ''
            }
        },
        created() {
            this.getCountryList();
            //this.initGtCaptcha();
        },
        methods: {
            handleReset(name) {
                this.$refs[name].resetFields();
            },
            getCountryList() {
                let api = '/uc/support/country';
                this.$http.post(this.host + api).then(response => {
                    let countryList = response.data.data;
                    this.countryList = countryList;
                })
            },
            getVerificationCode() {
                //this.initGtCaptcha();
                let tab = this.tab;
                let params = {};
                let api;
                if (tab === 'key1') {
                    this.formItem1.loading = true;
                    params["country"] = this.formItem1.country;
                    params["phone"] = this.formItem1.phoneNumber;
                    api = "/uc/mobile/code";
                }
                if (tab === 'key2') {
                    this.formItem2.loading = true;
                    params["email"] = this.formItem2.email;
                    api = "/uc/email/code";
                }
                this.$http.post(this.host + api, params).then(response => {
                    let status = response.data;
                    if (status.code !== 0) {
                        //alert('发送失败：' + status.message);
                        if (status.code === 300) {
                            this.title = '邮箱已绑定！';
                        } else {
                            this.title = '验证码发送失败！';
                            this.content = '<p>' + status.message + '</p><p>请再次尝试获取验证码</p>';
                        }
                        this.instance('error');
                        if (tab === 'key1') {
                            this.formItem1.loading = false;
                        }
                        if (tab === 'key2') {
                            this.formItem1.loading = false;
                            this.formItem1.show = false;
                            this.formItem2.loading = false;
                            this.formItem2.show = false;
                        }
                    } else {
                        //alert('发送成功！请前往邮箱查看')
                        this.title = '验证码发送成功！';
                        /*this.content = '请前往邮箱查看';
                        this.instance('success');*/
                        this.successMsg(this.title);
                        //生成发送验证码后的60秒倒计时
                        //设置两个锁，可以同时发送邮箱验证码和短信验证码
                        const TIME_COUNT = 60;
                        if (tab === 'key1') {
                            if (!this.formItem1.timer) {
                                this.formItem1.count = TIME_COUNT;
                                this.formItem1.loading = false;
                                this.formItem1.show = true;
                                this.formItem1.timer = setInterval(() => {
                                    if (this.formItem1.count > 0 && this.formItem1.count <= TIME_COUNT) {
                                        this.formItem1.count--;
                                    } else {
                                        this.formItem1.show = false;
                                        clearInterval(this.formItem1.timer);
                                        this.formItem1.timer = null;
                                    }
                                }, 1000)
                            }
                        }
                        if (tab === 'key2') {
                            if (!this.formItem2.timer) {
                                this.formItem2.count = TIME_COUNT;
                                this.formItem2.loading = false;
                                this.formItem2.show = true;
                                this.formItem2.timer = setInterval(() => {
                                    if (this.formItem2.count > 0 && this.formItem2.count <= TIME_COUNT) {
                                        this.formItem2.count--;
                                    } else {
                                        this.formItem2.show = false;
                                        clearInterval(this.formItem2.timer);
                                        this.formItem2.timer = null;
                                    }
                                }, 1000)
                            }
                        }
                    }
                    //alert("发送成功！请前往邮箱查看")
                })

            },
            disable() {
                let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
                if (this.formItem2.password.length > 5 && reg.test(this.formItem2.email) && this.formItem2.repassword === this.formItem2.password
                    && this.formItem2.emailCode !== null && this.formItem2.emailCode !== '' && this.formItem2.single) {
                    this.formItem2.isOk = true;
                } else {
                    this.formItem2.isOk = false;
                }
            },
            handleSubmit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let tab = this.tab;
                        let params = {};
                        let api;
                        if (tab === 'key1') {
                            if (this.formItem1.single) {
                                params["country"] = this.formItem1.country;
                                //params["countryCode"] = this.formItem1.countryCode;
                                params["phone"] = this.formItem1.phoneNumber;
                                params["code"] = this.formItem1.noteCode;
                                params["username"] = this.formItem1.username;
                                params["password"] = this.formItem1.password;

                                api = "/uc/register/phone";
                            } else {
                                this.title = '请阅读并同意《用户协议》';
                                this.errorMsg(this.title);
                                return;
                            }
                        }
                        if (tab === 'key2') {
                            if (this.formItem2.single) {
                                // params["country"] = this.formItem2.country;
                                params["email"] = this.formItem2.email;
                                params["code"] = this.formItem2.emailCode;
                                // params["username"] = this.formItem2.username;
                                params["password"] = this.formItem2.password;

                                api = "/uc/register/email";
                            } else {
                                this.title = '请阅读并同意《用户协议》';
                                this.errorMsg(this.title);
                                return;
                            }
                        }
                        params["ticket"] = this.ticket;
                        params["randStr"] = this.randStr;

                        this.$http.post(this.host + api, params).then(response => {
                            let status = response.data;
                            if (status.code !== 0) {
                                //alert('注册失败：' + status.message);
                                this.title = '注册失败！';
                                this.content = status.message;
                                this.instance('error');
                            } else {
                                //alert('注册申请以提交，请耐心等待审核结果');
                                // this.title = '注册申请已提交！';
                                // this.content = '请耐心等待审核结果';
                                // this.instance('success');
                                this.title = '注册成功';
                                this.successMsg(this.title);
                                setTimeout(() => {
                                    this.$router.push({path: '/login'});
                                }, 300);
                            }
                        }).catch(error => {
                            //alert('提交失败：' + error.statusText)
                            this.title = '注册请求提交失败！';
                            this.content = '<p>' + error.statusText + '</p><p>请再次提交请求</p>';
                            this.instance('error');
                        });

                    } else {
                        //this.$Message.error('Fail!');
                    }
                });
            },
            initGtCaptcha(name) {
                let reg;
                if (this.tab === 'key1') {
                    reg = /^1[34578]\d{9}$/;
                    this.title = '请输入正确的手机号码';
                }
                if (this.tab === 'key2') {
                    reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
                    this.title = '请输入正确的邮箱地址';
                }
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
                this.getVerificationCode();
            },
            instance(type) {
                const title = this.title;
                const content = this.content;
                switch (type) {
                    case 'info':
                        this.$Modal.info({
                            title: title,
                            content: content
                        });
                        break;
                    case 'success':
                        this.$Modal.success({
                            title: title,
                            content: content
                        });
                        break;
                    case 'warning':
                        this.$Modal.warning({
                            title: title,
                            content: content
                        });
                        break;
                    case 'error':
                        this.$Modal.error({
                            title: title,
                            content: content
                        });
                        break;
                }
            },
            successMsg(content) {
                this.$Message.success(content);
            },
            /*warningMsg (content) {
                this.$Message.warning(content);
            },*/
            errorMsg(content) {
                this.$Message.error(content);
            }
        }
    }
</script>

<style scoped lang="scss">
    .ivu-tabs-ink-bar {
        width: 390px !important;
    }

    .ivu-tabs-nav .ivu-tabs-tab {
        padding: 8px 9.5px;
    }

    .register_form .register_head .rePwd_input {
        margin-bottom: 20px;
    }

    .register_form .register_head .check-agree {
        margin-bottom: 20px;
    }

    .ivu-form-item {
        margin-bottom: 28px;
    }

    .ivu-btn-primary, .ivu-btn-primary:hover {
        border: none;
    }

    .check-agree /deep/ .ivu-checkbox-checked .ivu-checkbox-inner {
        border: 1px solid #f0ac19;
        background-color: #f0ac19;
    }

    .register_form {
        background: #0b1520 url(../../assets/images/login_bg.jpg) no-repeat center center;
        height: 660px;
        position: relative;
        overflow: hidden;
        .register_head {
            padding: 17px 30px;
            /*position: absolute;*/
            background: #17212e;
            width: 85%;
            height: 530px;
            margin: 25px auto;
            border-radius: 5px;
            .check-agree {
                color: #979797;
                display: inline-block;
                line-height: 30px;
                font-size: 12px;
                cursor: default;

                a {
                    color: #f0ac19;
                    margin-left: -10px;
                }
            }
        }

    }
</style>
