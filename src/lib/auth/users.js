import { getUserModel } from "../db/models/user";

export async function findUserByEmail(email) {
  const User = await getUserModel();
  return User.findOne({ email: String(email).toLowerCase() }).lean();
}

export async function findUserById(id) {
  const User = await getUserModel();
  if (!id) return null;
  try {
    return await User.findById(id).lean();
  } catch {
    return null;
  }
}

export async function findUserByGoogleId(googleId) {
  const User = await getUserModel();
  return User.findOne({ "providerIds.googleId": String(googleId) }).lean();
}

export async function createUser({
  email,
  passwordHash = null,
  name = null,
  image = null,
  provider = "credentials",
  googleId = null,
}) {
  const User = await getUserModel();
  const doc = await User.create({
    email: String(email).toLowerCase(),
    passwordHash,
    name,
    image,
    provider,
    providerIds: googleId ? { googleId: String(googleId) } : {},
    lastLoginAt: new Date(),
  });
  return doc.toObject();
}

export async function updateUserLastLogin(id) {
  const User = await getUserModel();
  await User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
}

export async function linkGoogleAccount(userId, googleId, image) {
  const User = await getUserModel();
  await User.findByIdAndUpdate(userId, {
    "providerIds.googleId": String(googleId),
    image,
  });
}
