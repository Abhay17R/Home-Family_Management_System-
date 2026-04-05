export const sendToken = async (user, statusCode, message, res) => {
  const token = await user.generateToken();

  // Sirf zaruri fields frontend ko bhejo
  const { _id, name, email, phone, role, familyId, parentId } = user;

  // Cookie options ko bilkul login jaisa set karein
  const cookieOptions = {
      expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions) // Updated options pass karein
    .json({
      success: true,
      message,
      token,
      user: { _id, name, email, phone, role, familyId, parentId },
    });
};