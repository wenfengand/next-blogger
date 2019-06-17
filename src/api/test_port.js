import {
  appid,
  appkey 
} from 'API/secret'

var { Query, User } = AV;
var APP_ID = appid;
var APP_KEY = appkey;

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


var query = new AV.Query('Article')
query.find()
.then((data) => {
    console.log('we have data length', data.length)
    console.log('get id', data[0].get('id'))
    console.log('get id', data[0].id)
}) 