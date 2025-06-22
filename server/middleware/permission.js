export const checkPermission=(permission)=>{
    return(req,res,next)=>{
        const user=req.user;
        if(user && user.permissions && user.permissions[permission]){
            next();
        }
        else{
            res.status(403).json({
                success:false,
                message:`Access Denied: You do not have the '${permission}' permission.`
            });
        }





    };
};