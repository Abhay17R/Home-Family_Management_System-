import {User} from '../models/userModel.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';


// PASSWORD CHANGE
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new passwords'
      });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password'
      });
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};



//2FA ENABLE/DISABLE
export const toggle2FA=async(req,res)=>{
    try { 
    const {enable}=req.body;
    const user=await User.findById(req.user.id);

    if(enable===undefined){
         return res.status(400).json({ success: false, message: "Enable status not provided." });
        
    }

    if(enable && !user.twoFactorAuth.secret){
        const secret=speakeasy.generateSecret({name:`Home(${user.email})`});

        user.twoFactorAuth.secret=secret.base32;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url,(err,data_url)=>{
            if(err) throw new Error("Could not generate QR code");
            return res.status(200).json({
                success:true,
                message:'Scan Qr code to enable 2FA',
                qrCode:data_url
            });
        });
    }else{
        user.twoFactorAuth.isEnabled=enable;
        await user.save();
        res.status(200).json({
            success:true,
            message:`2FA has been ${enable? 'enabled':'disabled'}.`
        });
    }
        
    } catch (error) {
        console.error("Error in toggle2FA:",error);
        res.status(500).json({success:false,message:'Server Error'});
    }

}


//Get Active Session
export const getActiveSessions=async(req,res)=>{
    try {
        const user=await User.findById(req.user.id);
        const currentToken=req.token
        const sessions = user.activeSessions.map(session => ({
      _id: session._id,
      deviceInfo: session.deviceInfo,
      locationInfo: session.locationInfo,
      lastActive: session.lastActive,
      isCurrent: session.token === currentToken // Agar token match hua, toh yeh current session hai.
    }));
       res.status(200).json({success:true,sessions});
        
    } catch (error) {

          console.error("Error in getActiveSessions:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
        
    }
};

//Logoutsession

export const logoutSession=async(req,res)=>{
    try{
        const{sessionId}=req.params; // URL se session ki ID nikalo (e.g., /api/settings/sessions/123abc).
        const user=await User.findById(req.user.id);

         // User ko current session se logout karne se roko.
         const sessionToLogout = user.activeSessions.find(s => s._id.toString() === sessionId);
    if (sessionToLogout && sessionToLogout.token === req.token) {
        return res.status(400).json({ success: false, message: "You cannot log out from the current session here." });
    }
     // `activeSessions` array se us session ko hata do jiski ID match hoti hai.
    user.activeSessions = user.activeSessions.filter(session => session._id.toString() !== sessionId);
    await user.save();
    
    res.status(200).json({ success: true, message: 'Session logged out successfully' });
  } catch (error)    {
    console.error("Error in logoutSession:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

//delete account

export const deleteAccount=async(req,res)=>{
    try {
        
        const {password}=req.body;
        if(!password){
            return res.status(400).json({ success: false, message: 'Password is required to delete your account' });
        }

        const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Account not deleted.' });
    }

    await User.findByIdAndDelete(req.user.id);
     res.status(200).json({ success: true, message: 'Your account has been permanently deleted.' });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};






    