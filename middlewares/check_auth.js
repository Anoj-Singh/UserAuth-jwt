const jwt = require("jsonwebtoken")

const checkAuth = (req,res,next)=>{
	const token = req.cookies['jwt']
	// console.log(token)
	if(!token){
		res.status(401).send({
			status:"failed",message:"you may login first !!"})
		return;
	}
	const verifyToken = jwt.verify(token,process.env.JWT_TOKEN_SECRET)
	if(!verifyToken){
		res.status(401).send({status:"failed",message:"you may login first!!"})
		return;
	};
	next()
}

module.exports = checkAuth;