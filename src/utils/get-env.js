// export const getEnv = (key: string, defaultValue: string = ""): string => {// this string tells the return type
//   const value = process.env[key];
//   if (value === undefined) {
//     if (defaultValue) {
//       return defaultValue;
//     }
//     throw new Error(`Enviroment variable ${key} is not set`);
//   }
//   return value;
// };

//Read environment variables from process.env with built-in safety checks

export const getEnv = (key, defaultValue = "") => {
  //it process.env[key] looks up the variable by name
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};
