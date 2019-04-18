var api = require('../../api.js');
var app = getApp().globalData;
export default Page({
    data: {
        '__code__': {
            readme: ''
        },

        driver: '',
        isLogin: false,
        isDriver: false,
        user: '',
        userInfo: '',
        busList: [{
            title: '我的快递',
            desc: '老司机送到哪里了',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/chepiao1.png',
            navUrl: '/pages/myticket/index'
        }, {
            title: '我要发车',
            desc: '发布你的bus路线',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/fache.png',
            navUrl: '/pages/newbus/index'
        }, {
            title: '我的乘客',
            desc: '哪些包裹上了我的车',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/chengke.png',
            navUrl: '/pages/passenger/index'
        }],
        userList: [{
            title: '我的地址',
            desc: '',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/location.png',
            navUrl: '/pages/address/index'
        }, {
            title: '我的优惠券',
            desc: '',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/youhuijuan.png',
            navUrl: '/pages/coupon/index'
        }, {
            title: '申请老司机',
            desc: '成为老司机赚钱啦',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/driver.png',
            navUrl: '/pages/driver/index'
        }],
        feedbackList: [{
            title: '客服与投诉',
            desc: '我要投诉',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/tousu1.png'
        }, {
            title: '意见反馈',
            desc: '',
            slot: false,
            src: 'https://www.ibwei.com/deliverbus/images/ekfu.png',
            navUrl: '/pages/message/index'
        }]
    },
    onLoad(option) {
        console.log(option);
        let isLogin = wx.getStorageSync('isLogin');
        if (isLogin) {
            let userInfo = wx.getStorageSync('userInfo');
            let user = wx.getStorageSync('user');
            this.setData({
                isLogin: true,
                userInfo: userInfo,
                user: user
            });
            this.isDriver1();
        }
    },
    onShow() {
        if (this.data.isLogin && !this.data.isDriver) {
            this.isDriver1();
        }
    },
    isDriver1() {
        var that = this;
        wx.request({
            url: api.user.isDriver,
            data: {
                '__code__': {
                    readme: ''
                },

                user_id: this.data.user.data.uid
            },
            method: 'POST',
            success: function (res) {
                if (res.data !== 'wait' && res.data !== 'no' && res.data !== 'dont') {
                    that.setData({
                        isDriver: true,
                        driver: res.data
                    });
                    wx.setStorageSync('isDriver', true);
                    wx.setStorageSync('driver', res.data);
                } else {
                    that.setData({
                        isDriver: false
                    });
                    wx.setStorageSync('isDriver', false);
                }
            }
        });
    },
    //跳转到相应的子页面
    navToDetail(e) {
        if (!this.data.isLogin) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            return false;
        }
        //
        let index = e.currentTarget.dataset.index;
        if (index == 2) {
            if (this.data.isDriver) {
                wx.showToast({
                    title: '你已经是老司机或者申请在审核中',
                    icon: 'none',
                    duration: 1500
                });
                return false;
            }
        }
        let navUrl = this.data.userList[index].navUrl;
        wx.navigateTo({
            url: navUrl
        });
    },
    navToDriver(e) {
        if (!this.data.isLogin) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            return false;
        }
        let index = e.currentTarget.dataset.index;
        console.log(index);
        if (index == 2 || index == 1) {
            if (!this.data.isDriver) {
                wx.showToast({
                    title: '您还不是老司机或处于申请中',
                    icon: 'none',
                    duration: 1500
                });
                return false;
            }
        }
        let navUrl = this.data.busList[index].navUrl;
        wx.navigateTo({
            url: navUrl
        });
    },
    navToFeed(e) {
        let index = e.currentTarget.dataset.index;
        if (index === 0) {
            wx.makePhoneCall({
                phoneNumber: '15723695007'
            });
            return false;
        }
        if (!this.data.isLogin) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
        } else {
            let navUrl = this.data.feedbackList[index].navUrl;
            wx.navigateTo({
                url: navUrl
            });
        }
    },
    showToast() {
        let $toast = this.selectComponent(".J_toast");
        $toast && $toast.show('该功能暂未启用');
    },
    showToast1() {
        let $toast = this.selectComponent(".login_toast");
        $toast && $toast.show('登录成功');
    },
    bindGetUserInfo: function (e) {
        let encryptedData = e.detail.encryptedData;
        let iv = e.detail.iv;
        let myInfo = e.detail.userInfo;
        this.setData({
            userInfo: myInfo
        });
        wx.setStorageSync('userInfo', myInfo);
        this.userLogin(encryptedData, iv, myInfo);
    },

    //用户登录
    userLogin(encryptedData, iv, myInfo) {
        console.log(myInfo);
        var that = this;
        wx.login({
            success: function (res) {
                if (res.code) {
                    //发起网络请求
                    console.log(res.code);
                    console.log("myInfo=" + myInfo);
                    wx.request({
                        url: api.user.login,
                        method: 'POST',
                        data: {
                            '__code__': {
                                readme: ''
                            },

                            code: res.code,
                            encryptedData: encryptedData,
                            iv: iv,
                            nickName: myInfo.nickName,
                            avatarUrl: myInfo.avatarUrl,
                            gender: myInfo.gender
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        success: function (ret) {
                            console.log(ret);
                            if (ret.statusCode === 200) {
                                wx.setStorageSync('user', ret.data);
                                wx.setStorageSync('userInfo', myInfo);
                                wx.setStorageSync('isLogin', true);
                                wx.setStorageSync('isDriver', false);
                                that.setData({
                                    isLogin: true,
                                    userInfo: myInfo,
                                    user: ret.data
                                });
                                that.isDriver1();
                                that.showToast1();
                            }
                        },
                        fail: function () {
                            console.log('login fali');
                            wx.showToast({
                                title: '服务器异常,请稍后登录',
                                icon: 'none',
                                duration: 2000
                            });
                        }
                    });
                } else {
                    wx.showToast({
                        title: '未知异常,请稍后登录',
                        icon: 'none',
                        duration: 2000
                    });
                }
            }
        });
    }
});