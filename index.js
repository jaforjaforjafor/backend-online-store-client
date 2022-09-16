const express = require('express');
const cors=require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, MongoRuntimeError } = require('mongodb');

const app = express()
const port =process.env.PORT|| 5000;
app.use(cors());
app.use(express.json());


//mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.enhjlyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function  run(){
    try {
        await client.connect();
        const serviceCollection=client.db('online-store-client').collection('services');
        const tServiceCollection=database.collection('tServices');

        app.get('/service', async(req, res)=>{
            const query={};
            const cursor=serviceCollection.find(query);
            const services=await cursor.toArray();
            res.send(services);
            
        });
        app.get('/tservice', async(req, res)=>{
            const query={};
            const cursor=tServiceCollection.find(query);
            const tServices=await cursor.toArray();
            res.send(tServices);
            
        });
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello backend online store-client!')
})

app.listen(port, () => {
  console.log(`backend online store-client-listening ${port}`)
})