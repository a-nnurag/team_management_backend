//Read environment variables from process.env with built-in safety checks

export const getEnv = (key, defaultValue = "") => {
  //it process.env[key] looks up the variable by name
  const value = process.env[key];
  if (value === null || value === undefined || value === "") {
    if (defaultValue) {
      return defaultValue;
    }
    console.log(`Environment variable ${key} is not set`);
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};
