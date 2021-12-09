//function to check if the email exists in the users database
const findUserByEmail = function(email,users) {
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

module.exports = {findUserByEmail};