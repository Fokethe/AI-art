const { envList } = require('../envList.js');

Page({
  onShow() {
  },
  data: {
    prompt: '',
    negativePrompt: '',
    seed: -1,
    sampleStep: 35,
    scale: 11,
    multiArray: [['512', '768'], ['512', '768', '1024']],
    multiIndex: [0, 0],
    imgPath: '',
    theme: 'light',
    envList,
    selectedEnv: envList[0],
  },

  //图片点击放大
  bindClickImg: function () {
    wx.previewImage({
      urls: [this.data.imgPath],
    })
  },

  // 提示词输入
  bindPromptInput: function (e) {
    this.data.prompt = e.detail.value;
    console.log('输入prompt:', this.data.prompt)
  },

  //反面提示词输入
  bindNPromptInput: function (e) {
    this.data.negativePrompt = e.detail.value;
    console.log('输入negativePrompt:', this.data.negativePrompt)
  },

  // 种子输入
  bindSeedInput: function (e) {
    this.data.seed = e.detail.value
    console.log('输入seed:', this.data.seed)
  },

  //分辨率选择
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },

  //分辨率选择
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    console.log(data.multiIndex);
    this.setData(data);
  },

  // 设置采样步数
  slider1change: function (e) {
    console.log('采样步数改变，携带值为', e.detail.value)
    this.setData({
      sampleStep: e.detail.value
    })
  },
  
  //设置采样规模
  slider2change: function (e) {
    console.log('采样规模改变，携带值为', e.detail.value)
    this.setData({
      scale: e.detail.value
    })
  },

  // 施法按钮
  bindGenerate: function () {
    console.log('生成', this.data.prompt, this.data.negativePrompt, this.data.seed, this.data.sampleStep, this.data.scale)
    var url = 'http://127.0.0.1:7860/generate-stream'//'http://127.0.0.1:7860//generate-stream'
    var params = {
      height: this.data.multiArray[1][this.data.multiIndex[1]],
      width: this.data.multiArray[0][this.data.multiIndex[0]],
      scale: this.data.scale ?? 12,
      steps: this.data.sampleStep ?? 28,
      noise: 0.2,
      strength: 0.7,
    }
    wx.showLoading({
      title: '正在努力画画中',
    });
    var that = this;

    //stable diffusion 接口调用
    wx.request({
      url: 'http://127.0.0.1:7860/sdapi/v1/txt2img',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: JSON.stringify({ ...params, prompt: this.data.prompt }),
      success: function (resp) {
        console.log(resp.data)

        if (resp.data && typeof resp.data === 'object') {
          var str = JSON.stringify(resp.data)
          if (str && str.includes('\\n')) {
            var ss = str.split('\\n')[2]
            if (ss && ss.includes(':')) {
              var imgPath = that.getBase64ImageUrl(ss.split(':')[1])
              that.setData({
                imgPath: imgPath
              });
            }
          }
        }

        wx.hideLoading();
      },
      fail: function (e) {
        wx.hideLoading();
        console.error(e)
      }
    })


// 云函数
    /*var that = this;
    wx.cloud.callFunction({
      name: 'httpFunctions',
      config: {
        env: this.data.selectedEnv.envId
      },
      data: {
        type: 'http',
        url: url,
        body: { ...params, prompt: this.data.prompt }
      },
      success: function (resp) {
        console.log(resp)

        if (resp && resp.result && typeof resp.result === 'object') {
          var resultStr = JSON.stringify(resp.result)
          if (resultStr.includes('\\n')) {
            var ss = resultStr.split('\\n')[2]
            if (ss.includes(':')) {
              var imgPath = that.getBase64ImageUrl(ss.split(':')[1])
              that.setData({
                imgPath: imgPath
              });
            }
          }
        }

        wx.hideLoading();
      },
      fail: function (e) {
        wx.hideLoading();
        console.error(e)
      }
    });*/
  },

  //把base64转换成图片
   saveImage:function(base64Data) {
    wx.getFileSystemManager().writeFile({
      filePath: `${wx.env.USER_DATA_PATH}/image.png`,
      data: base64Data,
      encoding: 'base64',
      success: function () {
        console.log('图片写入成功！');
      },
      fail: function (error) {
        console.log(error);
      }
    });
  }
  ,

  // 重置按钮
  bindReset: function () {
    console.log('重置',)
    this.setData({
      prompt: '',
      negativePrompt: '',
      seed: -1,
      sampleStep: 35,
      scale: 11,
      imgPath: ''
    })
  },

  onLoad() {
    this.setData({
      theme: wx.getSystemInfoSync().theme || 'light'
    })

    if (wx.onThemeChange) {
      wx.onThemeChange(({ theme }) => {
        this.setData({ theme })
      })
    }
  },
})


