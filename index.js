const express = require('express');
const cors=require('cors');
const jwt=require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, MongoRuntimeError } = require('mongodb');

const app = express()
const port =process.env.PORT|| 5000;
app.use(cors());
app.use(express.json());


//mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.enhjlyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req,res,next){
  const authHeader=req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({message:'access UnAuthorized'});
  }
  const token=authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded=decoded;
    next();
  })

};

async function  run(){
    try {
        await client.connect();
        const serviceCollection=client.db('online-store-client').collection('services');
        const teacherCollection=client.db('online-store-client').collection('teachers');
        const buyingCollection=client.db('online-store-client').collection('buyings');
        const contactingCollection=client.db('online-store-client').collection('contactings');
        const userCollection=client.db('online-store-client').collection('users');
        

        

        app.get('/service', async(req, res)=>{
            const query={};
            const cursor=serviceCollection.find(query);
            const services=await cursor.toArray();
            res.send(services);
            
        });
        //load all users in dashboard
        app.get('/user',verifyJWT, async (req,res)=>{
          const users=await userCollection.find().toArray();
          res.send(users); 
        });
        app.get('/admin/:email',async(req,res)=>{
          const email=req.params.email;
          const user=await userCollection.findOne({email:email});
          const isAdmin=user.role === 'admin';
          res.send({admin:isAdmin});
        })


        //from user to make admin
        app.put('/user/admin/:email',verifyJWT,async(req,res)=>{
          const email=req.params.email;
          const requester=req.decoded.email;
          const requesterAccount= await userCollection.findOne({email:requester});
          if (requesterAccount.role==='admin') {
            const filter={email: email};
            const updateDoc = {
            $set: {role:'admin'},
          };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.send(result);
          }
          else{
            res.status(403).send({message:'forbidden admin'})
          }
          

        })

        //user email and collection
        app.put('/user/:email',async(req,res)=>{
          const email=req.params.email;
          const user=req.body;
          const filter={email:email};
          const options={upsert: true};
          const updateDoc = {
            $set: user,
          };
          const result = await userCollection.updateOne(filter, updateDoc, options);
          const token=jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{ expiresIn:'5h' })
          res.send({result,token});

        });
        // //teacher service
        // app.post('/teacher', async (req,res)=>{
        //   const teachers=await teacherCollection.find().toArray();
        //   res.send(teachers); 
        // });
       

        /** 
        **api naming convention
        **app.get('/'buying)//get all buying in this collection.or get more than one by filter
        ****app.get('/'buying/:id)//get a specific buying
        ****app.post('/'buying)//add a new buying 
        ****app.patch('/'buying/:id)//update a new buying 
        ****app.put('/'buying/:id)//upsert ==> update if(exists)or insert(if doesnt exist) 

        ****app.delete('/'buying/:id)//delete one buying 
         */
        // app.get('/tservice', async(req, res)=>{
        //     const query={};
        //     const cursor=tServiceCollection.find(query);
        //     const tServices=await cursor.toArray();
        //     res.send(tServices);
            
        // });
        app.get('/buying',verifyJWT ,async (req,res)=>{
          const client=req.query.client;
          const decodedEmail=req.decoded.email;
          if (client===decodedEmail) {
            const query={client:client};
            const buyings=await buyingCollection.find(query).toArray();
           return res.send(buyings);
             }
             else{
              return res.status(403).send({ message: 'Forbidden access' })
             }
          
          
        })
        app.post('/buying',async(req,res)=>{
          const buying=req.body;
          const query={buyNow:buying.Name,client:buying.client};
          const exists=await buyingCollection.findOne(query);
          if(exists){
            return res.send({success:false,buying:exists});
          }
          const result=await buyingCollection.insertOne(buying);
          res.send({success:true,result});

        })
        //contact teacher
        app.post('/contacting',async(req,res)=>{
          const contacting=req.body;
          const query={contactNow:contacting.Name,client:contacting.client};
          const exists=await contactingCollection.findOne(query);
          if(exists){
            return res.send({success:false,contacting:exists});
          }
          const result=await contactingCollection.insertOne(contacting);
          res.send({success:true,result});

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