
          const mongoose = require('mongoose');
          const bcrypt = require('bcryptjs');


          // Define userSchema and User model
          const userSchema = new mongoose.Schema({
            userName: { type: String, unique: true, required: true },
            password: { type: String, required: true },
            email: { type: String, required: true },
            loginHistory: [
              {
                dateTime: { type: Date, required: true },
                userAgent: { type: String, required: true }
              }
            ]
          });
          
          let User; // to be defined on new connection (see initialize)
          
          // Initialize function to connect to the MongoDB instance
          module.exports.initialize = function () {
            return new Promise(function (resolve, reject) {
              let db = mongoose.createConnection("mongodb+srv://svhathiwala:Nancy@0301@webapp.t2exkcp.mongodb.net/?retryWrites=true&w=majority");
          
              db.on('error', (err) => {
                reject(err);
              });
              db.once('open', () => {
                User = db.model("users", userSchema);
                resolve();
              });
            });
          };
          
          // Function to register a new user
          module.exports.registerUser = function (userData) {
            return new Promise(function (resolve, reject) {
              if (userData.password !== userData.password2) {
                reject("Passwords do not match");
                return;
              }
          
              let newUser = new User(userData);
              newUser.save((err) => {
                if (err) {
                  if (err.code === 11000) {
                    reject("User Name already taken");
                  } else {
                    reject("There was an error creating the user: " + err);
                  }
                } else {
                  resolve();
                }
              });
            });
          };
          
          // Function to check user credentials and log in
          module.exports.checkUser = function (userData) {
            return new Promise(function (resolve, reject) {
              User.find({ userName: userData.userName })
                .then(users => {
                  if (users.length === 0) {
                    reject("Unable to find user: " + userData.userName);
                  } else if (users[0].password !== userData.password) {
                    reject("Incorrect Password for user: " + userData.userName);
                  } else {
                    // Record login history
                    const loginInfo = {
                      dateTime: new Date(),
                      userAgent: userData.userAgent
                    };
                    users[0].loginHistory.push(loginInfo);
          
                    // Update login history
                    User.updateOne(
                      { userName: users[0].userName },
                      { $set: { loginHistory: users[0].loginHistory } },
                      (err) => {
                        if (err) {
                          reject("There was an error verifying the user: " + err);
                        } else {
                          resolve(users[0]);
                        }
                      }
                    );
                  }
                })
                .catch(err => {
                  reject("Unable to find user: " + userData.userName);
                });
            });
          };
          const registerUser = (userData) => {
            return new Promise((resolve, reject) => {
                bcrypt.hash(userData.password, 10)
                    .then((hash) => {
                        userData.password = hash; // Update the user's password with the hashed version
                        return authData.addUser(userData);
                    })
                    .then((user) => resolve(user))
                    .catch((err) => reject("There was an error encrypting the password"));
            });
        };
        
        // Updated checkUser function
        const checkUser = (userData) => {
            return new Promise((resolve, reject) => {
                authData.getUserByUsername(userData.userName)
                    .then((user) => {
                        if (!user) {
                            reject(`User not found: ${userData.userName}`);
                            return;
                        }
                        bcrypt.compare(userData.password, user.password)
                            .then((result) => {
                                if (result) {
                                    resolve(user);
                                } else {
                                    reject(`Incorrect Password for user: ${userData.userName}`);
                                }
                            })
                            .catch((err) => reject(err));
                    })
                    .catch((err) => reject(err));
            });
        };
        
        module.exports = {
            registerUser,
            checkUser
        };