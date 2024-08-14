const mongoose = require("mongoose");

const conn = async()=>{
  try {
    await mongoose.connect(`mongodb+srv://ansh123:ansh123@cluster0.68xm3.mongodb.net/Podcaster`);
    console.log("Db connected");
    
  }catch(error){
    console.log(error);
  }
}

conn();