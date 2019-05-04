import axios from 'axios'
import Qs from 'qs'
import store from 'STORE/index'
//import AV from 'API/av'
import {
  getAccessToken,
  removeAccessToken,
  cachedAdminInfo
} from 'API/cacheService'

import {
  appid,
  appkey 
} from 'API/secret'
import {
  IS_LOGIN,
  SHOW_TOKEN_ERROR
} from 'STORE/mutation-types'

var { Query, User } = AV;
var APP_ID = appid;
var APP_KEY = appkey;

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
/* eslint-disable */
const API_ROOT = 'http://blogapi.codebear.cn/index.php'
const API_ROOT_DEV = '/localapi'

Array.prototype.removeByValue = function(val) {
  for(var i=0; i<this.length; i++) {
    if(this[i] == val) {
      console.log('remove ', val)
      this.splice(i, 1);
      break;
    }
  }
  return this
}
Array.prototype.contains = function (obj) {  
    var i = this.length;  
    while (i--) {  
        if (this[i] === obj) {  
            return true;  
        }  
    }  
    return false;  
}  
/* eslint-enable */
/*
axios.defaults.baseURL = (process.env.NODE_ENV === 'production' ? API_ROOT : API_ROOT_DEV)

axios.defaults.headers.Accept = 'application/json'

// Add a request interceptor
axios.interceptors.request.use(function (config) {
  if (config.url.indexOf('a/') === 0) {
    if (getAccessToken()) {
      config.headers['accessToken'] = getAccessToken()
    }
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  if (response.data.code < 0) {
    if (response.data.code === -4001) {
      // 清空登录信息
      removeAccessToken()
      cachedAdminInfo.delete()
      // // 弹出提示信息
      store.commit(SHOW_TOKEN_ERROR, true)
      // // 弹出登录窗口
      store.commit(IS_LOGIN, false)
    }
    let error = {
      msg: response.data.msg
    }
    return Promise.reject(error)
  }
  return response.data
}, function (error) {
  error = {
    msg: '请求出错'
  }
  return Promise.reject(error)
})
*/
function _checkCount(collection_name, field_name, target){
  return new Promise( (resolve, reject) => {
    var query = new AV.Query(collection_name) 
    query.equalTo(field_name, target)
    query.count()
    .then( (data) => {
      resolve({count:data})
    })
  })
  
}
function getCommonArticle(resolve, reject, articleId){
    var query = new AV.Query('Article')
    query.include('category')
    query.include('tags')
    query.include('author')
    query.get(articleId)
    .then( (data) => {
     
      data.attributes['id'] = data.id
      var article = data.attributes 
      var category = {}
      category.id = data.get('category').id
      category.name = data.get('category').get('name')
      
      var tags_org = data.get('tags')

      var tags = []
      // console.log('result[0] is ', results[0])
      if(tags_org){
        tags_org.forEach( (result, i, a) => {
        result.attributes['id'] = result.id
        tags = tags.concat( result.attributes )
      })
      }
      var author = data.get('author').attributes
      author.id = data.get('author').id 
      
      
      var ret_data = {}
      ret_data.tags = tags 
      ret_data.article = article 
      ret_data.category = category
      ret_data.author   = author 

      resolve(ret_data)
    })
}
function getValueById(modelName, id, col){
  return new Promise( (resolve, reject) => {
    var query = new AV.Query(modelName)
    query.get(id)
    .then( (data) => {
      resolve(data.get(col))
    })
  })
 
}
function getItemById(modelName, id){
  return new Promise( (resolve, reject) => {
    var query = new AV.Query(modelName)
    query.get(id)
    .then( (data) => {
      resolve(data)
    })
  })
 
}
var formatDate = function (date) {  
    var y = date.getFullYear();  
    var m = date.getMonth() + 1;  
    m = m < 10 ? ('0' + m) : m;  
    var d = date.getDate();  
    d = d < 10 ? ('0' + d) : d;  
    var h = date.getHours();  
    var minute = date.getMinutes();  
    minute = minute < 10 ? ('0' + minute) : minute; 
    var second= date.getSeconds();  
    second = second < 10 ? ('0' + second) : second;  
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+ second;  
}
function authorinfo(){

}
// get blogger full info 
function siteinfo(resolve, reject){
  // 需要额外获取的info 
  // blogInfo.articleCount blogInfo.categoryCount  blogInfo.tagCount 
  //
  var query = new AV.Query('BlogConfig');
  var result 
  query.find()
  .then( (results) => {
    result = results[0].attributes

    // get article count
    var query = new AV.Query('Article') 
    query.equalTo('status', '已发布')
    return query.count()
    
  })
  .then( (count) => {
    result.articleCount = count 

    // get category count
    var query = new AV.Query('Category') 
    return query.count()
  })
  .then( (count) => {
    result.categoryCount = count 
    // get tag count
    var query = new AV.Query('Tag') 

    return query.count()
  })
  .then( (count) => {
    result.tagCount = count 
    resolve(result) 
  })
}
// get article list
function commonArticleList(resolve1, reject1, params){
  var total_count
  var current_query
  var page_list
  var byTag = false
  Promise.resolve()
  .then( () => {
    if(params.hasOwnProperty('by')){
      if(params.by == 'category' ){
        var query = new AV.Query('Article')
        query.include('category')
        var category_p = AV.Object.createWithoutData('Category', params.categoryId)
        query.equalTo('category', category_p)
        if(params.isAdmin == false){
          query.equalTo('status', '已发布')
        }
        current_query = query
      
        query.descending('update_time')
        query.limit(params.pageSize);// 每页条数
        query.skip(params.page * params.pageSize);// 跳过页数
        return query.find()
       
       
      }else if( params.by == 'status'){
        var query = new AV.Query('Article')
        query.include('category')
        query.equalTo('status', params.status)
        // var category_p = AV.Object.createWithoutData('Category', params.categoryId)
        // query.equalTo('category', category_p)
       
        current_query =query
        query.descending('update_time')
        query.limit(params.pageSize);// 每页条数
        query.skip(params.page  * params.pageSize);// 跳过页数
        return query.find()
        
        
      }
      else if( params.by == 'tag'){
       
        var tag_p = AV.Object.createWithoutData('Tag', params.tagId)
        var query = new AV.Query('Article')
       
        
        query.equalTo('tags', tag_p)
        

        current_query = query
        query.descending('update_time')
        query.limit(params.pageSize);// 每页条数
        query.skip(params.page  * params.pageSize);// 跳过页数
        byTag = true  
        return query.find()
       
      }
    }
    else if(params.hasOwnProperty('searchValue')){
      var query1 = new AV.Query('Article')
   
      query1.contains('title', params.searchValue )

      var query2 = new AV.Query('Article')
    
      query2.contains('sub_message', params.searchValue )

      var query3 = new AV.Query('Article')
  
      query3.contains('content', params.searchValue )

      var query = AV.Query.or(query1, query2, query3)
      current_query = query 
    
      query.descending('update_time')
      query.limit(params.pageSize) // 每页条数
      query.skip(params.page  * params.pageSize) // 跳过页数

      return query.find()
    }
    // search for published article
    else{
        var query = new AV.Query('Article')
        query.include('category')
        if(params.isAdmin == false){
          query.equalTo('status', '已发布')
         
        }
       
        current_query = query
        query.descending('update_time')
        query.limit(params.pageSize);// 每页条数
        query.skip(params.page * params.pageSize);// 跳过页数
        return query.find()
       
      }
  })
  .then( (results) => {
    var article_list = []
    if(results){
      results.forEach((article, i, a) => {
      article.attributes['id'] = article.id 
      article.get('category').name = article.get('category').get('name')
      article_list = article_list.concat(article.attributes)
      })
    }
    page_list = article_list
    return current_query.count()
  })
  .then( (total_count) => {
    resolve1( {list:page_list, total:total_count})
  }) 
}
function handleUrl(url){
  if(url.charAt(0) != '/'){
    url = '/' + url 
  }
  if(url.charAt(url.length - 1) != '/'){
    url = url + '/'
  }
  return url 
}
// Save article 
function articleSave(resolve, reject, params){
  // if article has id, update it; else make a new one
  var old_article 
  var new_article
  var new_tags_id
  var new_tags  
  var article 
  Promise.resolve()
  .then( () => {
    
    if(params.hasOwnProperty('id')){
      // update article
      article = AV.Object.createWithoutData('Article', params.id)
    }else{
      // new article
      var Article = AV.Object.extend('Article')
      article = new Article()
      article.set('pageview', 0)
      article.set('create_time', new Date())

      
    }
    article.set('title', params.title)
    article.set('sub_message', params.sub_message)
    article.set('cover', params.cover)
    article.set('content', params.content)
    article.set('html_content', params.htmlContent)
    article.set('update_time', new Date())
    article.set('status', params.status)
    article.set('isEncrypt', params.isEncrypt)

    if(params.status == '已发布'){
      if(!params.publish_time){
        article.set('publish_time', new Date())
      }
    }
    // handle wrong article url
    if(params.url){
      
      article.set('url', handleUrl(params.url))
    }
    // set global new_article
    new_article = article  
    // return old article
    // for a new article, old article == new article, except category and tags
    if(params.hasOwnProperty('id')){
      var query = new AV.Query('Article')
      query.include('tags')
      return  query.get(article.id)
       
    }else{
      // article is regarded as cloud edition
      // give fack class and fake tags
      var fake_cat = AV.Object.createWithoutData('Category', '123456')
      article.set('category', fake_cat)
      article.set('tags', [])
      return Promise.resolve(article)
    }
    
  })
  .then( (_old_article) => {
    old_article = _old_article
    // handle new category problem
    if(params.category.hasOwnProperty('name')){
      if(params.category.name == ""){
        // 未分类时的默认ID
        var category = AV.Object.createWithoutData('Category', '5ca4bd53c05a800073823b89')
        return Promise.resolve(category)
      }else{
        // new category
        var Category = AV.Object.extend('Category')
        var cat = new Category()
        cat.set('name', params.category.name)

       
        cat.set('count', 1)
        
        cat.set('status', '正常')
        return cat.save()
        }
    }else{
      var category = AV.Object.createWithoutData('Category', params.category.id)
      return Promise.resolve(category)
    }
  })
  .then( (category) => {
    // save category count
    if(category.id != old_article.get('category').id ){
      category.increment('count', 1)
      category.save()

      // 如果原分类确实存在
      if(old_article.get('category').id != '123456'){
        var old_cat = AV.Object.createWithoutData('Category', old_article.get('category').id) 
        old_cat.increment('count', -1)
        old_cat.save()
      }
     
    }
    
    article.set('category', category)
    // return article.save()
    // handle new tags
    var proArr = []
    params.tags.forEach( (tag, i, a) => {
      // for new tag
      if(tag.hasOwnProperty('name')){
        var Tag = AV.Object.extend('Tag')
        var tag_ins = new Tag()
        tag_ins.set('name', tag.name)
        tag_ins.set('count', 0)
        tag_ins.set('status', '正常')
        proArr.push(Promise.resolve( tag_ins.save() ))
      }else{
      
        proArr.push(Promise.resolve( {id:tag.id}))
      }
    })
    return Promise.all(proArr)
  })
  .then( (_new_tags) => {
    // __new_tags is an array within dict or tag instance
    // here we transfer tags to tags instance
    new_tags = _new_tags  
    var temp_tags = []
    new_tags.forEach( (tag, i, a) => {
      var tag = AV.Object.createWithoutData('Tag', tag.id) 
      temp_tags.push(tag)
    })
    new_tags = temp_tags

    var old_tags = old_article.get('tags')  
    // Some article don't have tags column, set it with empty list
    if(!old_tags){
      old_tags = []
    }
    var delete_tags = []
    
    new_article.set('tags', new_tags)

    
    old_tags.forEach( (old_tag, i, a) => {
      var new_tags_contain = false
      new_tags.forEach( (new_tag, i, a) => {
         if( new_tag.id == old_tag.id ) {
            new_tags_contain = true 
            new_tags.splice(i, 1)
          }
      })
      if(new_tags_contain == false){
        delete_tags.push( old_tag )
      }
    })

    console.log('new tags ', new_tags) 
    console.log('delete tags', delete_tags)
    new_tags.forEach( (tag, i, a) => {
      tag.increment('count', 1)
      tag.save() 
    })
    // delete old tags map and decrement count
    delete_tags.forEach( (tag, i, a) => {
      tag.increment('count', -1)
      tag.save()
    })
    resolve(new_article.save())
   })
}
export default {
  isLogin (){
    var currentUser = AV.User.current();
    if (currentUser) {
      return true 
    }
    else {
      return false 
    }
  },
  /**
   * 管理员登录
   */
  adminLogin (params) {

    return AV.User.logIn(params.username, params.password)
  },
  adminSignOut() {
    AV.User.logOut()
  },
  /**
   * 获取七牛token
   */
  getQiniuToken (withWater) {
    /**
    return axios.get('a/qiniu/token', {
      params: {
        bucket: 'blogimg',
        withWater: withWater
      }
    })
    */
    return new Promise( (resolve, reject) => {
      var data = {}
      data.token = 'test_token'
      resolve(data)
    })
    
  },
  /**
   * 上传图片到七牛
   */
  uploadToQiniu (params) {
    return new Promise( (resolve, reject) => {
      var fileData = params.get('file_base64') 
      fileData = fileData.substr((fileData.indexOf(',') + 1)) 
      var file = new AV.File(params.get('name'), {base64: fileData});
      file.save()
      .then( (data) =>{
        var ret = {}
        ret.imgUrl = data.url()
        resolve(ret) 
      })
    })
   
  },
  /**
   * 获取博客配置
   */
  getBlogConfig () {
    return new Promise( (resolve, reject) => {
      bloginfo(resolve, reject) 
    })
    

    
  },
  /**
   * 修改博客配置
   */
  modifyBlogConfig (params) {
    /* params contains:
    alipayQrcode: "http://lc.stackoverflow.club/97d018f9763d2ff11e1e.jpg"
    avatar: "http://lc.stackoverflow.club/78eedb78fa559f6cf206.jpg"
    siteName: (...)
    github: (...)
    sign: (...)
    wxpayQrcode:
    */ 
    var BlogConfig = AV.Object.extend('BlogConfig')
    var config = new BlogConfig()
    if(params.alipayQrcode){
      config.set('alipayQrcode', params.alipayQrcode)
    }
    if(params.wxpayQrcode){
      config.set('wxpayQrcode', params.wxpayQrcode)
    }
    if(params.avatar){
      config.set('avatar', params.avatar)
    }
    if(params.siteName){
      config.set('siteName', params.siteName)
    }
    if(params.github){
      config.set('github', params.github)
    }
    if(params.sign){
      config.set('sign', params.sign)
    }
    return config.save()
  },
  /**
   * 获取 关于我 页面
   
  getAboutMe () {
    return axios.get('a/webConfig/getAbout')
  },
  */
  /**
   * 修改 关于我 页面
   
  modifyAboutMe (params) {
    return axios.post('a/webConfig/modifyAbout', Qs.stringify(params))
  },
  */
  /**
   * 获取首页面板显示的统计信息
   */
  /*
  getHomeStatistics () {
    return axios.get('a/statistics/home')
  },
  */
  /**
   * 获取系统日志
   
  getSysLog (params) {
    return axios.get('a/sys/log', {params: params})
  },
  */
  /**
   * 添加分类
   */
  addCategory (categoryName) {
    var Category = AV.Object.extend('Category')
    var cat = new Category()
    cat.set('name', categoryName)
    cat.set('count', 0)
    cat.set('status', '正常')
    return cat.save()
  },
  /**
   * 添加标签
   */
  addTag (tagName) {
    var Tag = AV.Object.extend('Tag')
    var tag = new Tag()
    tag.set('name', tagName)
    tag.set('count', 0)
    tag.set('status', '正常')
    return tag.save()
  },
  /**
   * 修改分类
   */
  modifyCategory (params) {
    // console.log('params is', params)
    var category_p = AV.Object.createWithoutData('Category', params.categoryId)
    category_p.set('name', params.categoryName)
    return category_p.save()
  },
  /**
   * 修改标签
   */
  modifyTag (params) {
    var tag_p = AV.Object.createWithoutData('Tag', params.tagId)
    tag_p.set('name', params.tagName)
    return tag_p.save()
  },
  /**
   * 删除分类
   */
  deleteCategory (categoryId) {
    var cat = AV.Object.createWithoutData('Category', categoryId);
    return cat.destroy()
  },
  /**
   * 删除标签
   */
  deleteTag (tagId) {
    var tag = AV.Object.createWithoutData('Tag', tagId);
    return tag.destroy()
  },
  /**
   * 获取分类列表
   */
  getCategoryList (params) {
    return new Promise( (resolve, reject) => {
      var query = new AV.Query('Category')
      query.limit(1000)
      query.find()
      .then( (results) => {
        var categories = []
        results.forEach( (result, i, a) => {
          var cat = {}
          cat.id = result.id 
          cat.name = result.get('name')
          cat.count = result.get('count') 
          cat.status = result.get('status')
          cat.createTime = result.get('createdAt') 
          cat.updateTime = result.get('updatedAt')
          categories = categories.concat( cat )
        })
        resolve(categories)
      })
    })
  },
  /**
   * 获取标签列表
   */
  getTagList (params) {
    return new Promise( (resolve, reject) => {
      var query = new AV.Query('Tag')
      query.limit(1000)
      query.find()
      .then( (results) => {
        var tags = []
        results.forEach( (result, i, a) => {
          var tag = {}
          tag.id = result.id 
          tag.name = result.get('name')
          tag.count = result.get('count') 
          tag.status = result.get('status')
          tag.createTime = result.get('createdAt') 
          tag.updateTime = result.get('updatedAt')
          tags = tags.concat( tag )
        })
        resolve(tags)
      })
    })
  },
  /**
   * 获取分类
   */
  getCategory (categoryId) {
    return new Promise( (resolve, reject) => {
      var query = new AV.Query('Category');
      query.get(categoryId)
      .then( (category) => {
        var cat = {}
        cat.id = category.id 
        cat.name = category.get('name')
        cat.count = category.get('count') 
        cat.status = category.get('status')
        cat.createTime = category.get('createdAt') 
        cat.updateTime = category.get('updatedAt')
        resolve(cat)
      })
    })
  },
  /**
  * check for duplicate url
  *  检查url是否重复
   */
  checkCount( params ){
    // return _checkCount(collection_name, field_name, target )
    return new Promise( (resolve, reject) => {
      var query = new AV.Query(params.collection_name) 
      query.equalTo(params.field_name, params.target)
      query.count()
      .then( (data) => {
        resolve({count:data})
        })
    })
  },
  /**
   * 获取标签
   */
  getTag (tagId) {
     return new Promise( (resolve, reject) => {
      var query = new AV.Query('Tag');
      query.get(tagId)
      .then( (_tag) => {
        var tag = {}
        tag.id = _tag.id 
        tag.name = _tag.get('name')
        tag.count = _tag.get('count') 
        tag.status = _tag.get('status')
        tag.createTime = _tag.get('createdAt') 
        tag.updateTime = _tag.get('updatedAt')
        resolve(tag)
      })
    })
  },
  /**
   * 新增文章
   */
  saveArticle (params) {
    params.status = '已保存'
    return new Promise( (resolve, reject) => {
      articleSave(resolve, reject, params)
    })
    
  },
  /**
   * 发布文章
   */
  publishArticle (params) {
    params.status = '已发布'
    return new Promise( (resolve, reject) => {
      articleSave(resolve, reject, params)
      
    })
    
  },
   /**
   * 发布文章
   */
  sendToCOS (params) {
    
    return new Promise( (resolve, reject) => {
      var article = {}

      article.articleId = params.id 
      article.url = handleUrl(params.url)
      article.title = params.title
      article.sub_message =  params.sub_message
      article.cover = params.cover
      article.pageview = 0
      article.publish_time =  formatDate(params.publish_time),
      article.update_time  =  formatDate(params.update_time),
  
      article.html_content = params.htmlContent
      getValueById('Category', params.category.id, 'name')
      .then( (name) => {
        params.category.name = name

        article.category = {
            "url":"/list?type=category&id=" + params.category.id,
            "name":params.category.name 
        }
        article.tags = []
        var proArr = []
     
        params.tags.forEach( (tag, i, a) => {
        
          proArr.push(Promise.resolve(getItemById('Tag', tag.id)))
        
        })
        return Promise.all(proArr)
      })
      .then( (data) => {
        data.forEach( (tag, i, a) => {
          var pub_tag = {
              "url":"/list?type=tag&id=" + tag.id,
              "name":tag.get('name')
          }
          article.tags.push(pub_tag)
        })
         console.log(article) 

        var query = new AV.Query('Secret')
        query.equalTo('name', 'sendToCOSUrl')
        return query.find()
      })
      .then( (data) => {
        
        if(data.length == 1){
          data = data[0] 
          var url = data.get('content')
          console.log('url is', url) 
          
        }else{
          console.log('url is') 
          
        }
        // set static to true 
        save_article = AV.Object.createWithoutData('Article', params.id)
        save_article.set('static', true)
        save_article.save()
        resolve(axios({
          method:"post",
          url:url,
          data:JSON.stringify(article),
          headers:{
              "content-type":"application/x-www-form-urlencoded; charset=utf-8"
          }
        }))
      })
     
    })
    
  },
  /**
   * 编辑文章后存入草稿箱
   */
  modifyArticle (params) {
    params.status = '已保存'
    return new Promise( (resolve, reject) => {
      articleSave(resolve, reject, params)
    })
  },
  /**
   * 标记文章为删除
   */
  deleteArticle (articleId) {
    return new Promise( (resolve, reject) => {
       
      var query = new AV.Query('Article')
      query.include('category')
      query.get(articleId)
      .then( (article) => {
        // 修改属性
        article.set('status', '已删除')
        article.save()

        // 对category进行减一
        var category = AV.Object.createWithoutData('Category', article.get('category').id)
        category.increment('count', -1) 
        category.save() 

        // 获取tag map
        var innerQuery = new AV.Query('TagMap')
        innerQuery.equalTo('article_id', article)
        return innerQuery.find()
      })
      .then( (tagMap) => {
        tagMap.forEach( (sig, i, a) =>{
          var tag = AV.Object.createWithoutData('Tag', sig.get('tag_id').id)
          tag.increment('count', -1)
          tag.save()

          // 对tagmap删除
          sig.destroy()
        })
        resolve('done')
      })
    })
    
  },
   /**
   * 彻底删除文章
   */
  destroyArticle (articleId) {
    var article = AV.Object.createWithoutData('Article', articleId)
    
    // 在云端删除
    return article.destroy()
    
  },
  /**
   * 获取文章信息
   */
  getArticle (articleId) {
    return new Promise( (resolve, reject) => {
      getCommonArticle(resolve, reject, articleId)
    })
  },
  /**
   * 获取文章列表
   */
  getArticleList (params) {
    params.isAdmin = true
    return new Promise( (resolve1, reject1) => {
      commonArticleList(resolve1, reject1, params)
    })
     
  },
  /**
   * 获取友链列表
   
  getFriendsList (params) {
    return axios.get('a/friends/list', {
      params: params
    })
  },
  */
  /**
   * 添加友链
   
  addFriend (params) {
    return axios.post('a/friends/add', Qs.stringify(params))
  },
  */
  /**
   * 编辑友链
   
  modifyFriend (params) {
    return axios.post('a/friends/modify', Qs.stringify(params))
  },
  */
  /**
   * 删除友链
  
  deleteFriend (friendId) {
    return axios.post('a/friends/delete', Qs.stringify({friendId: friendId}))
  },
   */
  /**
   * 获取友链类型列表
  
  getFriendTypeList () {
    return axios.get('a/friends/typeList')
  },
   */
  /**
   * 获取所有评论列表
   */
  /*
  getAllCommentsList (params) {
    return axios.get('a/comments/alllist', {
      params: params
    })
  },
  */
  /**
   * 获取文章评论列表
   */
  /*
  getComments (articleId) {
    return axios.get('a/comments/list', {
      params: {
        articleId: articleId
      }
    })
  },
  */
  /**
   * 添加评论
   */
  /*
  adminReplyComments (params) {
    return axios.post('a/comments/add', Qs.stringify(params))
  },*/
  /**
   * 删除评论
   */
  /*
  deleteComments (id) {
    return axios.post('a/comments/delete', Qs.stringify({commentsId: id}))
  },
  */
  /**
   * 获取 我的简历 页面
   
  getResume () {
    return axios.get('a/webConfig/getResume')
  },
  */
  /**
   * 修改 我的简历 页面
  
  modifyResume (params) {
    return axios.post('a/webConfig/modifyResume', Qs.stringify(params))
  },
   */
  // ---------------------------------------------以下是博客页面使用的接口---------------------------------------------,
  /**
   * 获取 关于我 页面
   
  getBlogAboutMe () {
    return axios.get('w/getAbout')
  },
  */
  /**
   * 获取博客信息
   */
  getSiteInfo () {
    return new Promise( (resolve, reject) => {
      siteinfo(resolve, reject)
    })
    
  },
  /**
   * 获取文章列表
   */
  getBlogArticleList (params) {
    params.isAdmin = false
    return new Promise( (resolve1, reject1) => {
      commonArticleList(resolve1, reject1, params)
    })
  },
  /**
   * 获取文章归档列表
  
  getBlogArticleArchives (params) {
    return axios.get('w/article/archives', {
      params: params
    })
  },
   */
  /**
   * 获取文章信息
   */
  getBlogArticle (articleId) {
    return new Promise( (resolve, reject) => {
      getCommonArticle(resolve, reject, articleId)
    })
    
  },
 
  
  /**
   * 获取分类列表
   */
  getBlogCategoryList () {
    return new Promise( (resolve, reject) => {
      var query = new AV.Query('Category')
      query.find()
      .then( (results) => {
        var categories = []
        results.forEach( (result, i, a) => {
          var cat = {}
          cat.id = result.id 
          cat.name = result.get('name')
          cat.count = result.get('count') 
          categories = categories.concat( cat )
        })
        resolve(categories)
      })
    })
    
  },
  /**
   * 获取标签列表
   */
  getBlogTagList () {
    return new Promise( (resolve, reject) => {
      var query = new AV.Query('Tag')
      query.find()
      .then( (results) => {
        var tags = []
        results.forEach( (result, i, a) => {
          var tag = {}
          tag.id = result.id 
          tag.name = result.get('name')
          tag.count = result.get('count') 
          tags = tags.concat( tag )
        })
        resolve(tags)
      })
    })
  },
  /**
   * 获取友链列表
  
  getBlogFriendsList () {
    return axios.get('w/friends/list')
  },
   */
  /**
   * 获取文章评论列表
   */
  getBlogComments (articleId) {
    // console.log('comments list', articleId)
    return new Promise((resolve, reject) => {
      var article = AV.Object.createWithoutData('Article', articleId)

      var query = new AV.Query('Comment')
      var comments  = []
      var proArr = []
      query.equalTo('articleId', article) 
      query.equalTo('parentId', 0) 
      query.equalTo('status', '正常') 
      query.find()
      .then( (data) => {
        
        data.forEach( (single, i, a) => {
          single.attributes['createTime'] = single.createdAt 
          single.attributes['articleId'] = single.get('articleId').id
          single.attributes['children'] = []
          comments = comments.concat( single.attributes)

          var child_query = new AV.Query('Comment')
          child_query.equalTo('parentId', single.get('id'))
          child_query.equalTo('status', '正常')
          proArr.push(Promise.resolve(child_query.find()))
        })
        return Promise.all(proArr)
      })
      .then( (queries) => {
        
        queries.forEach( (results, i, a) => {
          // for every query
          results.forEach( (child) => {
            child.attributes['createTime'] = child.createdAt 
            child.attributes['articleId'] = child.get('articleId').id
            comments.forEach( (com, i, a) => {
            if(child.get('parentId') == com.id){
              com.children.push(child.attributes)
            }
            })
          })
          
        })
        
        resolve(comments) 
      })  
    })
  },
  /**
   * 添加评论
   */
  replyComments (params) {
    // console.log('comments add ', params)
    /* comment add params 
    articleId: "5ca424b1a91c9300725990d5"
    content: "[{"type":"text","content":"测试评论"}]"
    name: "wenfengand"
    randstr: "@0dh"
    replyId: 0
    sourceContent: "测试评论"
    ticket: "t024LGDAz99NiLRG5OS-HWFM6kbYDaZiMFJ--zFEkKuxeKZx60VT_YdXnmQ7I7AzxMyqfyBeWWjcmvvT4XjouQDReKR-F3dWP0mM2O0GDAsM1VepuqGZxyXYw**"
    
    email: "wenfengand@126.com" can omit 
    */
    var article = AV.Object.createWithoutData('Article', params.articleId)
    
    var Comment = AV.Object.extend('Comment')
    var comment = new Comment()
    comment.set('articleId', article) 
    comment.set('content', params.content) 
    comment.set('name', params.name)
    comment.set('randstr', params.randstr) 
    comment.set('sourceContent', params.sourceContent) 
    comment.set('ticket', params.ticket) 
    comment.set('replyId', params.replyId) 
    comment.set('parentId', params.parentId)
    comment.set('status', '正常')
    if(params.email){
      comment.set('email', params.email)
    }
    
    
    return comment.save()
  },
  /**
   * 获取 我的简历 页面
   
  getBlogResume () {
    return axios.get('w/getResume')
  },
  */
 
  // * 按文章标题和简介搜索
   
  searchArticle (params) {
    /* in params we got :
    searchValue: this.searchValue,
    page: this.page,
    pageSize : this.pageSize
    */
    params.isAdmin = false
    return new Promise( (resolve1, reject1) => {
      commonArticleList(resolve1, reject1, params)
    })
  }
  
}
