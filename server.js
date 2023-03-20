//Mariah Moore
//Express server

var express = require("express");
var http=require("http");

var redis = require("redis");
var iored = require("ioredis");

var app;
var messages = [{}]


db_client = redis.createClient();
db_client.connect();
db_client.on('connect', function()
{
    console.log('connected!')
})

app = express()
app.use(express.static(__dirname+"/client"));
app.use(express.urlencoded({extended:true}));
http.createServer(app).listen(8080);



async function addToMessages(keys)
{
    for(const key of keys)
    {
        value = await db_client.get(key);
         
        messages.push({[key]:value})
        console.log("Messages currently,",messages)
    }

    
}
async function populateMessages()
{
    
    await addToMessages( await db_client.sendCommand(['keys','*']))
        
     
}
async function getMessages()
{

    await populateMessages().then(()=>
    {
        console.log("getting messages")
        return messages;
    })
    
}
async function checkDB(key,value)
{
    console.log("start checkDB")
    // await db_client.exists(key, function(err,reply)
    // {
    //     console.log("got here!!!")
    //     if (reply === 1){
    //         console.log("Exists")
    //     }else{
    //         console.log("doesnt exist")
    //         db_client.set(key,value);
    //     }
    // })
    valu = await db_client.get(key);
    console.log(value)
    if(valu == null){
        await db_client.set(key,value);
        messag= "Account created"
        console.log("account create")
    }else{
        messag = "Username taken"
        console.log("username taken :(")
    }
    
    return messag
    
}
async function checkPass(key,value)
{
    console.log("start checkDB")
   
    valu = await db_client.get(key);
    console.log(value)
    if(valu == value){
        await db_client.set(key,value);
        messag= "Sign in successful"
    }else{
        messag = "Username or Password wrong"
    }
    
    return messag
    
}

app.get("/todos",async function(req,res){
    console.log(messages);
    messages = [{}]
    // await getMessages().then(()=>
    // {
    //     res.json(messages);
    // })
    
});

app.get("/newuser",function(req,res)
{
    //res.send("New User!")
    //res.sendFile(path.join(__dirname+ "/contact.html"));
    res.sendFile("/client/contact.html", {root : __dirname});
    // if(messages != null){
    //     res.send(messages);
    // }
    
});
app.get("/sign",function(req,res)
{
    //res.send("New User!")
    //res.sendFile(path.join(__dirname+ "/contact.html"));
    res.sendFile("/client/sign.html", {root : __dirname});
    //res.json(messages);
    //res.json(messag);
});

app.post("/todoss",async function(req,res){
    var message=req.body;
    console.log(message)
    console.log("here we are")
    //messages.push(message)
    messag = ""
    for(const[key,value] of Object.entries(message)){
        await checkDB(key,value).then(()=>
        {
            console.log("checkDB ran")
            res.send(messag);
            console.log(messag);
            //messages.push(messag)
        })
    }
    res.json({"message" : "Posted to server!!"})
});

app.post("/todos",async function(req,res){
    var message=req.body;
    console.log(message)
    console.log("here we are!")
    
    messag = ""
    for(const[key,value] of Object.entries(message)){
        await checkPass(key,value).then(()=>
        {
            console.log("checkPass ran")
            res.send(messag);
            console.log(messag);
            messages.push(messag)
            console.log(messages)
        })
    }
    res.json({"message" : "Posted to server!"})
});