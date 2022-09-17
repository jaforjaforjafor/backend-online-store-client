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
        const buyingCollection=client.db('online-store-client').collection('buyings');
        // const tServiceCollection=database.collection('tServices');

        app.get('/service', async(req, res)=>{
            const query={};
            const cursor=serviceCollection.find(query);
            const services=await cursor.toArray();
            res.send(services);
            
        });

        /** 
        **api naming convention
        **app.get('/'buying)//get all buying in this collection.or get more than one by filter
        ****app.get('/'buying/:id)//get a specific buying
        ****app.post('/'buying)//add a new buying 
        ****app.patch('/'buying/:id)//update a new buying 
        ****app.delete('/'buying/:id)//delete one buying 
         */
        // app.get('/tservice', async(req, res)=>{
        //     const query={};
        //     const cursor=tServiceCollection.find(query);
        //     const tServices=await cursor.toArray();
        //     res.send(tServices);
            
        // });
        app.post('/buying',async(req,res)=>{
          const buying=req.body;
          const query={buyNow:buying.Name,client:buying.client}
          const result=await buyingCollection.insertOne(buying);
          res.send(result);

        })
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