const bcrypt = require('bcrypt')

const securePassword = async (password) => {
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

module.exports = securePassword;
