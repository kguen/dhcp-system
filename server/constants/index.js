module.exports = {
  passwordRegex: /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
  phoneRegex: /(03|05|07|08|09|01[2689])([0-9]{8})\b/,
};