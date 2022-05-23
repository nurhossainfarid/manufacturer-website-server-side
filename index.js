const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())


// Mongodb server
const uri = `mongodb+srv://${process.env.ACCESS_USER}:${process.env.ACCESS_PASSWORD}@cluster0.nd7ni.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async() => {
    try {
        await client.connect();
        const carCollection = client.db('carCollection').collection('products');
        const reviewsCollection = client.db('carCollection').collection('reviews');

        /* -------------------------------------- car Collection --------------------------------------------- */
        app.get('/products', async (req, res) => {
            const result = await carCollection.find().toArray();
            res.send(result);
        });
        
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await carCollection.findOne(query).toArray();
            res.send(order);
        })

        /* -------------------------------------- reviews Collection --------------------------------------- */
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        });

        


    }
    finally {
        
    }
}
run().catch(console.dir);



// Initial check
app.get('/', (req, res) => {
    res.send('Welcome to car parts manufacture website');
});

app.listen(port, () => {
    console.log('Server is running');
})