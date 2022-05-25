const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())

// jwt verify 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({message: 'UnAuthorized Access'})
    } 
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_PASSWORD, function (err, decoded) {
        if (err) {
            return res.status(403).send({message: 'Forbidden Access'})
        }
        req.decoded = decoded;
        next();
    })
}



// Mongodb server
const uri = `mongodb+srv://${process.env.ACCESS_USER}:${process.env.ACCESS_PASSWORD}@cluster0.nd7ni.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async() => {
    try {
        await client.connect();
        const carCollection = client.db('carCollection').collection('products');
        const reviewsCollection = client.db('carCollection').collection('reviews');
        const userCollection = client.db('carCollection').collection('users');
        const orderCollection = client.db('carCollection').collection('orders');
        const commentCollection = client.db('carCollection').collection('comments');
        const profileCollection = client.db('profileCollection').collection('profiles');

        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
              next();
            }
            else {
              res.status(403).send({ message: 'forbidden' });
            }
        }


        /* -------------------------------------- car Collection --------------------------------------------- */
        app.get('/products', async (req, res) => {
            const result = await carCollection.find().toArray();
            res.send(result);
        });

        app.post('/products',verifyJWT, async (req, res) => {
            const add = req.body;
            console.log(add);
            const result = await carCollection.insertOne(add);
            res.send(result);
        })

        /* -------------------------------------- reviews Collection --------------------------------------- */
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        });

        /* -------------------------------------- users Collection --------------------------------------- */
        app.get('/user', verifyJWT, async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isRole = user.role == 'admin';
            res.send({admin : isRole});
        })
        
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
              const filter = { email: email };
              const updateDoc = {
                $set: { role: 'admin' },
              };
              const result = await userCollection.updateOne(filter, updateDoc);
              res.send(result);
        })
        
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };
            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: user
            }

            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_PASSWORD, { expiresIn: '1d' });
            res.send({ result, token })
        });


        /* -------------------------------------- order Collection --------------------------------------- */
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await carCollection.findOne(query);
            res.send(order);
        })

        app.get('/orders', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.send(result);
        })

        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.userEmail;
            const decodedEmail = req.decoded.userEmail;
            if (decodedEmail === email) {
                const result = await orderCollection.find({email: email}).toArray();
                res.send(result);
            }
            else {
                return res.status(403).send({ message: 'forbidden access' });
            }
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        app.delete('/orders/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(filter);
            res.send(result);
        })


        /* -------------------------------------- comments Collection --------------------------------------- */
        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        })


        /* -------------------------------------- users Collection --------------------------------------- */
        app.put('/profile/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email};
            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };
            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: user
            }

            const result = await profileCollection.updateMany(filter, updateDoc, options);
            res.send({result})
        })

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