<template>
    <div class="findPwd_form">
        <div class="findPwd_head">
            <h1 align="center" style="color: #2f3d52; font-size: 32px">{{$t('uc.forget.forget')}}</h1>
            <Tabs v-model="tab" size="default">
                <TabPane :label="label2" name="key2">
                    <Form ref="formItem2" :model="formItem2" :rules="ruleItem" label-position="top">
                        <FormItem :label="$t('uc.forget.email')" prop="email">
                            <!--防止自动填入用户名密码-->
                            <Input type="password"  style="position: absolute;z-index: -999"/>
                            <Input v-model="formItem2.email" :placeholder="$t('uc.forget.emailtip')"></Input>
                        </FormItem>
                        <FormItem :label="$t('uc.forget.emailcode')" prop="emailCode">
                            <!--防止自动填入用户名密码-->
                            <Input type="password"  style="position: absolute;z-index: -999"/>
                            <Input v-model="formItem2.emailCode" :placeholder="$t('uc.forget.emailcodetip')">
                                <Button :loading="formItem2.loading" slot="append">
                                    <span v-if="!formItem2.loading" v-show="!formItem2.show" @click="initGtCaptcha(formItem2.email)">{{$t('uc.forget.sendcode')}}</span>
                                    <span v-else v-show="!formItem2.show">{{$t('uc.forget.sendingcode')}}</span>
                                    <span v-show="formItem2.show">{{ formItem2.count }}s 后获取验证码</span>
                                </Button>
                            </Input>
                        </FormItem>
                        <!--<FormItem label="用户名" prop="username">
                            <Input v-model="formItem2.username" placeholder="请输入用户名" style="width: 390px"></Input>
                        </FormItem>-->
                        <FormItem :label="$t('uc.forget.password')" prop="password">
                            <!--防止自动填入用户名密码-->
                            <Input type="password"  style="position: absolute;z-index: -999"/>
                            <Input type="password" v-model="formItem2.password" :placeholder="$t('uc.forget.newpwdtip')" style="width: 390px"></Input>
                        </FormItem>
                        <FormItem :label="$t('uc.forget.confirmpassword')" prop="repassword">
                            <Input type="password" v-model="formItem2.repassword" :placeholder="$t('uc.forget.pwdvalidate1')" style="width: 390px"></Input>
                        </FormItem>
                        <!--<FormItem class="check-agree">
                            <Checkbox v-model="formItem2.single">{{$t('uc.regist.agreement')}}</Checkbox>
                            <a href="#/helpdetail?cate=1&id=17&cateTitle=常见问题" target="_blank" style="">《{{$t('uc.regist.userprotocol')}}》</a>
                        </FormItem>-->
                        <FormItem class="findPwd_submit">
                            <Button type="primary" @click="handleSubmit('formItem2')" long>{{$t('uc.forget.save')}}</Button>
                        </FormItem>
                    </Form>
                </TabPane>
            </Tabs>
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
                label1: (h) => {
                    return h('div', [ h('span', { style: { fontSize: '20px' } }, '手机找回') ])
                },
                label2: (h) => {
                    return h('div', [ h('span', { style: { fontSize: '20px' } }, this.$t('uc.forget.findByEmail'))])
                },
                tab: 'key2',
                countryList: [],
                formItem1: {
                    phoneNumber: '',
                    noteCode: '',
                    loading: false,
                    show: false,
                    password: '',
                    repassword: '',
                    count: '',
                    timer: null
                },
                formItem2: {
                    email: '',
                    emailCode: '',
                    loading: false,
                    show: false,
                    password: '',
                    repassword: '',
                    single: false,
                    count: '',
                    timer: null
                },
                captchaObj: null,
                _captchaResult: null,
                ruleItem: {
                    // country: [
                    //     { required: true, message: this.$t('uc.regist.countrytip')/*this.$t("uc.regist.countrytip")*/, trigger: 'change' }
                    // ],
                    phoneNumber: [
                        //{ required: true, message: '请输入手机号码'/*this.$t("uc.regist.teltip")*/, trigger: 'blur' },
                        { required: true, validator: validatePhone, trigger: 'blur' }
                    ],
                    noteCode: [
                        { required: true, message: this.$t('uc.regist.smscodetip'), trigger: 'blur' }
                    ],
                    email: [
                        { required: true, message: this.$t('uc.regist.emailtip')/*this.$t("uc.regist.teltip")*/, trigger: 'blur' },
                        { type: 'email', message: this.$t('uc.regist.emailerr'), trigger: 'blur' }
                    ],
                    emailCode: [
                        { required: true, message: this.$t('uc.regist.emailcodetip'), trigger: 'blur' }
                    ],
                    /*username: [
                        { required: true, message: this.$t('uc.regist.usernametip'), trigger: 'blur' }
                    ],*/
                    password: [
                        { required: true, message: this.$t('uc.regist.pwdtip'), trigger: 'blur' },
                        { type: 'string', min: 6, message: this.$t('uc.regist.pwdmsg'), trigger: 'blur' }
                    ],
                    repassword: [
                        //{ required: true, message: '请确认密码', trigger: 'blur' },
                        { validator: validateRepassword, trigger: 'blur' }
                    ]
                },
                isRegister: '',
                ticket: '',
                randStr: '',
                title: '',
                content: ''
            }
        },
        /*created() {
            this.getCountryList();
            //this.initGtCaptcha();
        },*/
        methods: {
            /*getCountryList() {
                let api = '/uc/support/country';
                this.$http.post(this.host + api).then(response => {
                    let countryList = response.data.data;
                    this.countryList = countryList;
                    // console.log(countryList)
                })
            },*/
            getVerificationCode() {
                //this.initGtCaptcha();
                let tab = this.tab;
                let params = {};
                let api;
                if (tab === 'key1') {
                    this.formItem1.loading = true;
                    params["country"] = this.formItem1.country;
                    params["phone"] = this.formItem1.phoneNumber;
                    api = "/uc/mobile/reset/code";
                }
                if (tab === 'key2') {
                    this.formItem2.loading = true;
                    params["account"] = this.formItem2.email;
                    api = "/uc/email/reset/code";
                }
                this.$http.post(this.host + api, params).then(response => {
                    let status = response.data;
                    if (status.code !== 0) {
                        //alert('发送失败：' + status.message);
                        this.title = '验证码发送失败！';
                        this.content = '<p>' + status.message + '</p><p>请再次尝试获取验证码</p>';
                        this.instance('error');
                        if (tab === 'key1') this.formItem1.loading = false;
                        if (tab === 'key2') this.formItem1.loading = false;
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
            handleSubmit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let tab = this.tab;
                        let params = {};
                        let api;
                        if (tab === 'key1') {
                            /*params["country"] = this.formItem1.country;
                            //params["countryCode"] = this.formItem1.countryCode;
                            params["phone"] = this.formItem1.phoneNumber;
                            params["username"] = this.formItem1.username;*/
                            params["account"] = this.formItem1.phoneNumber;
                            params["code"] = this.formItem1.noteCode;
                            params["password"] = this.formItem1.password;
                            params["mode"] = 0;

                            api = "/uc/reset/login/password";
                        }
                        if (tab === 'key2') {
                            /*params["country"] = this.formItem2.country;
                            params["username"] = this.formItem2.username;*/
                            params["account"] = this.formItem2.email;
                            params["code"] = this.formItem2.emailCode;
                            params["password"] = this.formItem2.password;
                            params["mode"] = 1;

                            api = "/uc/reset/login/password";
                        }

                        this.$http.post(this.host + api, params).then(response => {
                            let status = response.data;
                            if (status.code !== 0) {
                                //alert('注册失败：' + status.message);
                                this.title = '修改密码失败！';
                                this.content = status.message;
                                this.instance('error');
                            } else {
                                //alert('注册申请以提交，请耐心等待审核结果');
                                this.title = '密码修改成功';
                                /*this.content = '请耐心等待审核结果';
                                this.instance('success');*/
                                this.successMsg(this.title);
                                this.$router.push({ path: '/login'})
                            }
                        }).catch(error => {
                            //alert('提交失败：' + error.statusText)
                            this.title = '密码修改请求提交失败！';
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
                var self = this;
                var captcha1 = new TencentCaptcha("2040846200", function (res) {
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
            instance (type) {
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
            successMsg (content) {
                this.$Message.success(content);
            },
            errorMsg (content) {
                this.$Message.error(content);
            }
        }
    }
</script>

<style scoped lang="scss">
    .findPwd_head /deep/ .ivu-tabs-ink-bar {
        width: 390px !important;
        /*transform: translate3d(195px, 0px, 0px) !important;*/
    }
    .findPwd_head /deep/ .ivu-tabs-nav .ivu-tabs-tab {
        padding: 8px 9.5px;
    }
    .ivu-form-item {
        margin-bottom: 28px;
    }
    .findPwd_submit /deep/ .ivu-btn {
        font-size: 16px;
    }
    .findPwd_form {
        background: #0b1520 url(../../assets/images/login_bg.jpg) no-repeat center center;
        height: 760px;
        position: relative;
        overflow: hidden;
        .findPwd_head {
            padding: 30px 30px;
            position: absolute;
            background: #17212e;
            width: 450px;
            height: 545px;
            left: 50%;
            top: 50%;
            margin-left: -190px;
            margin-top: -255px;
            /*border-top: 4px solid #f0ac19;*/
            border-radius: 5px;
        }
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
            .ivu-checkbox-wrapper.ivu-checkbox-wrapper-checked {
                .ivu-checkbox.ivu-checkbox-checked {
                    .ivu-checkbox-inner {
                        border: 1px solid #f0ac19;
                        background-color: #f0ac19;
                    }
                }
            }
        }
    }
</style>

