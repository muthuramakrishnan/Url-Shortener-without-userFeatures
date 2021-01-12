const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const shortId = require('shortid');
const cors = require('cors');
const port = process.env.PORT || 5000;
const url = "mongodb+srv://dbUser:dbUser@cluster0.cejmf.mongodb.net/<dbname>?retryWrites=true&w=majority";
const dbName = "Cluster0";

app.use(bodyParser.json());
app.use(cors({
    origin:"https://stoic-hodgkin-24a38b.netlify.app"
}));


app.get('/', (req,res)=>{
    res.send('hello');
});
app.post('/shortUrls',async (req,res)=>{
    try{
        //open the connection
        let connection = await MongoClient.connect(url);
        //select the DB
        let db = connection.db(dbName);
        //perform action
        let resultArray = await db.collection("shortUrlCollection").find({"fullUrl":req.body.fullUrl}).toArray();
        if(resultArray.length==0)
        await db.collection("shortUrlCollection").insertOne({"fullUrl":req.body.fullUrl, "shortUrl": shortId.generate(), "clicks": 0});
        //close the connection
        connection.close();
        res.json({
            "message":"url shortened"
        });
    }
    catch(err){
        console.log(err);
    }
});

app.get('/shortUrls',async(req,res)=>{
    try{
        let connection = await MongoClient.connect(url);
        let db = connection.db(dbName);
        let urls = await db.collection("shortUrlCollection").find().toArray();
        connection.close();
        res.json(urls);
    }
    catch(err){
        console.log(err);
    }

});

app.get('/:url',async (req,res)=>{
    try{
        let connection = await MongoClient.connect(url);
        let db = connection.db(dbName);
        let fullUrl = await db.collection("shortUrlCollection").find({"shortUrl":req.params.url}).toArray();
        db.collection("shortUrlCollection").updateOne({"shortUrl": req.params.url}, { $set: {"clicks": fullUrl[0].clicks+1}});
        connection.close();
        res.redirect(fullUrl[0].fullUrl);
    }
    catch(err){
        console.log(err);
    }
});



app.listen(port, ()=>{
    console.log('server is running at: '+port);
});
