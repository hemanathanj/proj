var express = require('express')
var bodyParser=require('body-parser')

app=express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
const MongoClient=require('mongodb').MongoClient
const redis=require("redis")
const client=redis.createClient(6379, '127.0.0.1')
const jwt=require('jsonwebtoken')

const secret="uewfbwubfbowejfbow"
const async=require('async')
const { query } = require('express')
var url="mongodb+srv://hem:123456Hemu@cluster0.cfibr.mongodb.net/test_db?retryWrites=true&w=majority"
client.on('connect', function () {
    console.log('redis connected');
    console.log(`connected ${client.connected}`);
}).on('error', function (error) {
    console.log(error);
});
function insertQuery(tableName,Query){
    return new Promise((resolve,reject)=>{
 

MongoClient.connect(url, { useNewUrlParser: true },function(err,client) {
  var dbo = client.db("test_db")
  console.log("hemu")
  dbo.collection(tableName).insertMany(Query,function(err,result){
      if(err){
          console.log(err)
        reject(err)
      }
      else
        resolve(result)
  })
});
})
}
function getValue(token){
    return new Promises((resolve,reject)=>{
        client.get(token,function(err,data){
            if(err)
                reject(err)
            else
                resolve(data)
        })
    })

}
function getQuery(tableName,Query){
    return new Promise((resolve,reject)=>{
 

        MongoClient.connect(url, { useNewUrlParser: true },function(err,client) {
          var dbo = client.db("test_db")
          dbo.collection(tableName).find(Query).toArray(function(err,result){
              if(err)
                reject(err)
              else
                resolve(result)
          })
        });
        })  
}
app.post('/registerUser',function(req,res){
var obj={}
obj['name']=req.body.name
obj['email']=req.body.email
obj['password']=req.body.password

getQuery('userTable',{email:req.body.email}).then(result=>{
    console.log('h')
    console.log(result.length)
    if(result){
        console.log("hemu")
        var querys=[obj]
        insertQuery('userTable',querys).then(result2=>{
            res.json({message:"Successfully registered"})
        }).catch(err=>{
            res.status(500).json('unable to register the user')
        })
    }
}).catch(err=>{
    res.status(500).json('unable to register the user')
})

})

app.post('/loginUser',function(req,res){
    
    findQuery={$and:[{email:req.body.email},{password:req.body.password}]}
    getQuery('userTable',findQuery).then(result=>{
        if(result.length!=0){
            var token=jwt.sign({id:req.body.email},secret,{
                expiresIn:86400
            })
            var d = new Date();
            var time = d.getTime()
            client.set(token,[req.body.email,time])
            client.expire(token,86400)
            res.json({message:'SuccessFully logged in',token:token})
        }
        else{
            getQuery('userTable',{email:req.body.email}).then(result2=>{
                if(result2.length!=0)
                    res.status(500).json('kindly check your credentials')
                else
                res.status(500).json('user is not registered')
                })
        }
            
        
    })
    
    })


    app.get('/getUser',function(req,res){
    
        var token=req.headers['x-access-token']

        getValue(token).then(result=>{
            
                getQuery('userTable',{email:result[0]}).then(result2=>{
                    if(result2.length!=0)
                        res.status(500).json('kindly check your credentials')
                    else
                    res.status(500).json('user is not registered')
                    })
           
           })
        })

        app.get('activeLogin',function(req,res){
            client.keys('*', function (err, keys) {
                if (err) return console.log(err);
                if(keys){
                    async.map(keys, function(key, cb) {
                       client.get(key, function (error, value) {
                            if (error) return cb(error);
                            var obj = {};
                            obj['token']=key;
                            obj['value']=value;
                            cb(null, obj);
                        }); 
                    }, function (error, results) {
                       if (error) return console.log(error);
                       console.log(results);
                       res.json({data:results});
                    });
                }
            });
        })
   


        app.listen(4000,()=>{
            console.log('server has started')
        })