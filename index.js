const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');

const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload());
require('dotenv').config();
const port = 5000;

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const uri = process.env.DB_URI;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const uri = "mongodb+srv://travelguide:travelguide123@cluster0.kv4hu.mongodb.net/travelguide?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




client.connect(err => {
    const services = client.db("travelGuide").collection("services");
    const orders = client.db("travelGuide").collection("orders");
    const reviews = client.db("travelGuide").collection("reviews");
    const admins = client.db("travelGuide").collection("admins");

    console.log(' Database connection Successful');

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const price = req.body.price;
        const description = req.body.description;
        console.log(description);

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        services.insertOne({ name, price, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        services.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addOrder', (req, res) => {
        const orderInfo = req.body;
        orders.insertOne(orderInfo)
            .then(result =>
                res.send(result.insertedCount > 0));
    })

    app.post('/addReview', (req, res) => {
        const reviewInfo = req.body;
        reviews.insertOne(reviewInfo)
            .then(result =>
                res.send(result.insertedCount > 0));
    })

    app.get('/allReviews', (req, res) => {
        reviews.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addAdmin', (req, res) => {
        admins.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const emailGiven = req.body.email;
        admins.find({ email: emailGiven })
            .toArray((err, documents) => {
                res.send(documents.length > 0);
            })
    })

    app.post('/allOrders', (req, res) => {
        const email = req.body.email;
        admins.find({ email: email })
            .toArray((err, documents) => {
                if (documents.length === 0) {
                    filter = { email: email };
                } else {
                    filter = {};
                }
                orders.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            })
    })

    app.get('/allBookings', (req, res) => {
        orders.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
        services.deleteOne({ _id: ObjectID(req.params.id) })
            .then((result) => {
                res.send(result.deletedCount > 0);
            })
    })

    app.patch('/updateStatus/:id', (req, res) => {
        orders.updateOne({ _id: ObjectID(req.params.id) }, {
            $set: { status: req.body.orderStatus }
        })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    })
});


app.get('/', (req, res) => {
    res.send('Hello Traveler');
})

app.listen(process.env.PORT || port);