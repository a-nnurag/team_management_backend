import bcrypt from "bcrypt";

export const hashValue = async (password, saltRounds) => {
  return await bcrypt.hash(password, saltRounds);
};

export const compareHashValue = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
