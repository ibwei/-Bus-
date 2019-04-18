var api = require('../../api.js');
export default Page({
    data: {
        '__code__': {
            readme: ''
        },

        card_img: [],
        display: '',
        card_number: '',
        name: '',
        startSites: '',
        school: {
            value: 0,
            title: '请点击选择学校'
        },
        address: '',
        path: '',
        formData: {}
    },
    onLoad(option) {
        let isLogin = wx.getStorageSync('isLogin');
        if (!isLogin) {
            wx.redirectTo({
                url: '/pages/mine/index',
                success: function (res) {
                    wx.showToast({
                        title: '请先登录',
                        icon: 'none',
                        duration: 2000
                    });
                }
            });
            return false;
        }
        var that = this;
        let user = wx.getStorageSync('user');
        let user_id = user.data.uid;
        let isDriver = wx.getStorageSync('isDriver');
        if (isDriver) {
            wx.switchTab({
                url: '/pages/mine/index',
                success: function (res) {
                    wx.showToast({
                        title: '你已经是老司机了',
                        duration: 2000,
                        icon: 'none'
                    });
                }
            });
        } else {
            this.getDriver(user_id);
        }
        let schoolList = wx.getStorageSync('schoolList');
        that.setData({
            startSites: schoolList
        });
        let currentSchool = wx.getStorageSync('currentSchool');
        if (!currentSchool) {
            wx.switchTab({
                url: '/pages/home/index',
                success: function (res) {
                    wx.showToast({
                        title: '请先选择你所在的学校',
                        duration: 2000,
                        mask: true,
                        icon: 'none'
                    });
                }
            });
        }
        if (currentSchool) {
            console.log(currentSchool);
            that.setData({
                school: currentSchool
            });
        }
    },
    getDriver(user_id) {
        wx.request({
            url: api.user.isDriver,
            data: {
                '__code__': {
                    readme: ''
                },

                user_id: user_id
            },
            method: 'POST',
            header: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + wx.getStorageSync('user').data.token
            },
            success: function (res) {
                if (res.data == 'ok') {
                    console.log('已经是老司机');
                    wx.navigateBack({
                        delta: 1
                    });
                    wx.showToast({
                        title: '你已经是老司机了！',
                        duration: 2000,
                        mask: true,
                        icon: 'none'
                    });
                    return;
                } else if (res.data == 'wait') {
                    console.log('正在申请');
                    wx.navigateBack({
                        delta: 1
                    });
                    wx.showToast({
                        title: '你已提交申请，请耐心等待',
                        duration: 2000,
                        mask: true,
                        icon: 'none'
                    });
                    return;
                } else {
                    console.log('不是老司机');
                }
            },
            fail: function (res) {
                wx.showToast({
                    title: '异常错误',
                    duration: 1000,
                    icon: 'none'
                });
            }
        });
    },
    bindPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', this.data.startSites[e.detail.value]);
        // console.log(e);
        this.setData({
            school: this.data.startSites[e.detail.value]
        });
    },
    watchName: function (event) {
        this.setData({
            name: event.detail.value
        });
    },
    watchCardNum: function (event) {
        this.setData({
            card_number: event.detail.value
        });
    },
    watchAddress: function (event) {
        this.setData({
            address: event.detail.value
        });
    },
    applyDriver() {
        wx.showToast({
            title: '正在处理,请勿重复提交',
            duration: 12000,
            icon: 'none'
        });
        let card_img = this.data.card_img;
        let formData = this.data.formData;
        let name = this.data.name;
        let card_number = this.data.card_number;
        let school = this.data.school;
        let address = this.data.address;
        if (name == '' || card_number == '' || school == '' || address == '' || school == '请选择学校') {
            wx.showToast({
                title: '请填写相关信息',
                duration: 1000,
                icon: 'none'
            });
            return;
        }
        this.upload_file(api.user.uploadCardImg, card_img, 'photo', formData);
    },
    chooseImageTap() {
        console.log('选择图片');
        let _this = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#000000",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        _this.chooseWxImage('album');
                    } else if (res.tapIndex == 1) {
                        _this.chooseWxImage('camera');
                    }
                }
            }
        });
    },
    chooseWxImage(type) {
        let _this = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: [type],
            success: function (res) {
                //console.log(res);
                _this.setData({
                    card_img: res.tempFilePaths,
                    display: true
                });
            }
        });
    },

    upload_file(url, filePaths, name, formData) {

        let _this = this;
        wx.uploadFile({
            url: url,
            filePath: filePaths[0],
            name: name,
            formData: formData,
            success: function (res) {
                console.log("成功回调" + res.data);
                var data = JSON.parse(res.data);
                if (data.err == 0) {
                    console.log('成功');
                    console.log(data.path);
                    _this.setData({
                        path: data.path
                    });
                    let card_img = _this.data.card_img;
                    let formData = _this.data.formData;
                    let name = _this.data.name;
                    let card_number = _this.data.card_number;
                    let school = _this.data.school;
                    let address = _this.data.address;
                    let user = wx.getStorageSync('user');
                    let user_id = user.data.uid;
                    wx.request({
                        url: api.driver.newDriver,
                        data: {
                            '__code__': {
                                readme: ''
                            },

                            card_number: card_number,
                            name: name,
                            school: school.value,
                            address: address,
                            path: data.path,
                            user_id: user_id
                        },
                        method: 'POST',
                        header: {
                            'Accept': 'application/json',
                            'Authorization': 'Bearer ' + wx.getStorageSync('user').data.token
                        },
                        success: function (res) {
                            // console.log(res.data)
                            if (res.data == 'ok') {
                                wx.navigateBack({
                                    delta: 1
                                });
                                wx.showToast({
                                    title: '申请已提交，请耐心等待',
                                    duration: 2000,
                                    icon: 'none'
                                });
                            } else {
                                wx.showToast({
                                    title: '异常错误',
                                    duration: 1000,
                                    icon: 'none'
                                });
                            }
                        },
                        fail: function (res) {
                            wx.showToast({
                                title: '异常错误',
                                duration: 1000,
                                icon: 'none'
                            });
                        }
                    });
                } else {
                    wx.showToast({
                        title: '异常错误',
                        duration: 1000,
                        icon: 'none'
                    });
                }
            },
            fail: function (res) {
                wx.showToast({
                    title: '异常错误',
                    duration: 1000,
                    icon: 'none'
                });
            }
        });
    }
});