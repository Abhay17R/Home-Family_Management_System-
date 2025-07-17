export const sendToken = async (user, statusCode, message, res) => {
  const token = await user.generateToken();

  const { _id, name, email, phone, role, familyId, parentId } = user;

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS ke liye
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    partitioned:true,
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: { _id, name, email, phone, role, familyId, parentId },
    });
};
