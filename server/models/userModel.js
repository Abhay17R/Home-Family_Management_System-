  import mongoose from "mongoose";
  import bcrypt from "bcrypt";
  import jwt from "jsonwebtoken";
  import crypto from "crypto";
  // import defaultavatar from '../../img/dp.png';


  const SessionSchema=new mongoose.Schema({
    token:{type:String,required:true},
    deviceInfo:{type:String,default:'Uknown Device'},
    locationInfo:{type:String,default:'Uknown Location'},
    ipAddress:{type:String},
    lastActive:{type:Date,default:Date.now}
  });



  const userSchema = new mongoose.Schema({
    name: String,
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    bio: {
      type: String,
      default: '',
      maxLength: [250, "Bio can't exceed 250 characters"]
    },
    avatar: {
      public_id: { type: String, default: 'avatars/default_avatar' }, // Default avatar id
      url: { type: String, default: 'https://i.postimg.cc/3rgrqVDw/dp.png' } // Default avatar url
    },
    password: {
      type: String,
      minLength: [8, "Password must contain at least 8 characters."],
      maxLength: [32, "Password can't exceed 32 characters"],
      select: false,
    },
    permissions: {
      locationTracking: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: true },
  },
    phone: String,
    accountVerified: { type: Boolean, default: false },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    location: {
          lat: { type: Number },
          lng: { type: Number },
      },
      lastUpdated: {
          type: Date,
      },
      isSharing: {
          type: Boolean,
          default: true,
      },

    // Admin-Child system fields
    role: {
      type: String,
      enum: ["admin", "child"],
      default: "child",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    familyId: {
      type: String,
      required: function () {
        return this.role === "child";
      },
      default: function () {
        return this.role === "admin" ? crypto.randomBytes(8).toString("hex") : null;
      },
    },
    twoFactorAuth:{
      secret:{type:String,default:''},
      isEnabled:{type:Boolean,default:false},
    },
    activeSessions:[SessionSchema]
    
    
  }, {
    timestamps: true
  });

  // Unique verified emails only
  userSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { accountVerified: true } }
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

  userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  userSchema.methods.generateVerificationCode = function () {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const verificationCode = parseInt(firstDigit + remainDigits);
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    return verificationCode;
  };

  userSchema.methods.generateToken = async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };

  userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
  };

  export const User = mongoose.model("User", userSchema);
