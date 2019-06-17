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

export default {
    // set a specific filed 
    get(collection, known_dict, fetch_list, include_list, operation_dict){
        var query = new AV.Query(collection) 
        for(var key in known_dict){
            if(operation_dict.known == 'eq'){
                query.equalTo(key, known_dict[key])
            }
            // others comparision is not implemented
            
        }
        if(fetch_list != null){
            query.select(fetch_list)
        }
        if(include_field != null){
            query.include(include_list)
        }

        
        query.find()

        query.count()
        .then( (data) => {
        resolve({count:data})
        }
    }