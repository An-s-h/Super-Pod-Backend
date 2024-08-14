const jsw=require("jsonwebtoken")
const User =require("../models/user")

const authMiddleWare= async (req,res,next)=>{
  const token=req.cookies.podcasterUserToken;
  try {
    if(token){
      const decode=await jsw.verify(token,process.env.JWT_SECRET);
      const user=await User.findById(decode.id);
      if(!user){
        return res.status(404).json({msg:"User Not Found"})
      }
      req.user=user;
      next();
    }
    
  } catch (error) {
    res.status(500).json({msg:"Invalid Token"});
  }
}
module.exports=authMiddleWare;