const mongoose = require('mongoose');

const uri = "mongodb+srv://furkanburakozturk1_db_user:iIjg5NWNcZAQ0ZK7@cluster0.fihtt66.mongodb.net/trip2godb?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const tripCount = await db.collection('trips').countDocuments();
  const userCount = await db.collection('users').countDocuments();
  
  console.log('Trips count in Atlas:', tripCount);
  console.log('Users count in Atlas:', userCount);
  
  const users = await db.collection('users').find({}).toArray();
  console.log('Users:', users.map(u => u.email));
  
  process.exit(0);
}

run();
