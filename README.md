# 博客

> 这是我的博客前端以及后台管理系统源码，使用vue+element ui，实现响应式博客系统。博客页面参考hexo next主题，后台管理首页参考tale。

## 博客地址

[http://codebear.cn](http://codebear.cn/?ADTAG=gh)

## 效果图

### 博客-pc
![博客-pc](/readme-file/博客.gif)

### 博客-手机

![博客-手机](/readme-file/博客-手机.gif)

### 博客-后台管理-pc
![博客-后台管理-pc](/readme-file/博客-后台管理.gif)

### 博客-后台管理-手机

![博客-后台管理-手机](/readme-file/博客-后台管理-手机.gif)

## 博客实现功能
- [x] 首页（文章列表）
- [x] 分类/标签列表
- [ ] 文章归档
- [ ] ‘关于’页面
- [ ] 友链
- [x] 文章详情页
- [x] 分类/标签 对应的文章列表
- [ ] 搜索功能（按文章标题和简介搜索）
- [x] 文章详情页标题目录导航
- [x] 评论
- [ ] 简历页
- [ ] 图片集

## 博客后台管理实现功能
- [x] 登录
- [ ] 首页（显示文章、标签、系统日志等统计数据）
- [x] 发布/编辑/删除文章
- [x] 添加/编辑/删除分类
- [x] 添加/编辑/删除标签
- [x] 添加/编辑/删除友链
- [ ] 编辑‘关于’页面
- [x] 编辑博客配置页面（头像、昵称等）
- [x] 管理评论
- [ ] 简历编辑
- [ ] 修改管理员密码
## 依赖
1. 腾讯云COS python SDK `pip install cos-python-sdk-v5`
## 历史记录
* 20190414 去除tag和article之间的中间表，影响到的api：获取article详细信息；保存article内容；
## LICENSE

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2019, wenfengand
