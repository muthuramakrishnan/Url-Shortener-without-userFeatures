const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const shortId = require('shortid');
const cors = require('cors');
const port = process.env.PORT || 5000;
const url = "mongodb://localhost/27017";
const dbName = "shortener";

app.use(bodyParser.json());
app.use(cors({
    origin:"http://127.0.0.1:5500"
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
        db.collection("shortUrlCollection").insertOne({"fullUrl":req.body.fullUrl, "shortUrl": shortId.generate(), "clicks": 0});
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