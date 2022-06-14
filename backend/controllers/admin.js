const ManagementClient = require("auth0").ManagementClient;
const UserGroup = require('../models/userGroup');
const {User} = require('../models/user');
const config = require("../config/configure");
const _ = require('lodash');
const clientConfig = config.auth0ManagementClient;

const management = new ManagementClient({

  domain: clientConfig.domain,
  token: clientConfig.token,
  scope: 'read:users update:users delete:users create:users'
});

// const token = new OAuthAuthenticator({
//   clientSecret: clientConfig.clientSecret
// })

// function getTokenRefresh(){
//   const expireTime = req.user.exp;
//   if(!expireTime){
//     return token.refreshToken().then((data)=>{
//       res.status(200).json({data})      
//     }).catch((err)=>res.status(500).json({err}));
//   }
//   return clientConfig.token = token;
// }

function getUsers(req, res) {
  const params = {
    search_engine: "v3",
    q: `NOT app_metadata.roles:"superadmin"`,
    // connection: clientConfig.connection
  };
  management
    .getUsers(params)
    .then((users) => {
      res.status(200).json({ users })
    })
    .catch((err) => {
      console.log("error", err);
      res.status(500).json({ msg: err.message });
    });

}

function getUser(req, res) {
  const id = req.params.id;
  if (!id) return res.status(500).end();
  const params = { id: id };
  // const data = req.body.app_metadata.roles;
  management
    .getUser(params)
    .then((users) => {
      res.status(200).json({ users })
    })
    .catch((err) => {
      console.log("error", err);
      res.status(500).json({ msg: err.message });
    });

}

function blockUser(req, res) {
  const id = req.params.id;
  if (!id) return res.status(500).end();
  const params = { id: id };
  const data = { blocked: true };

  updateUserData(res, id, data)

  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

function unblockUser(req, res) {
  const id = req.params.id;
  if (!id) return res.status(500).end();
  const params = { id: id };
  const data = { blocked: false };

  updateUserData(res, id, data)
  
  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

function updateUserData(res, userId, data) {
  User.findOne({ userId: userId })
  .then((user) => {
    if (!user) {
      const newUser = new User();
      newUser.userId = userId;
      newUser.blocked = false
      newUser.roles = ["guest"]
      newUser.save()
      user = newUser
    }
    
    User.updateOne({ userId: user.userId }, {$set:data})
  })

  User.updateOne({ userId: userId }, data).catch((err) => res.status(500).end(err.message))
}

function changeToGuest(req, res) {
  const id = req.params.id;
  const data = {
    app_metadata: {
      roles: ["guest"],
    },
  };

  updateUserData(res, id, {roles: ["guest"]})
  if (!id) return res.status(500).end();
  const params = { id: id };
  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

function changeToUser(req, res) {
  const id = req.params.id;
  const data = {
    app_metadata: {
      roles: ["user"],
    },
  };
  updateUserData(res, id, {roles: ["user"]})
  if (!id) return res.status(500).end();
  const params = { id: id };
  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

function changeToAdmin(req, res) {
  const id = req.params.id;
  const data = {
    app_metadata: {
      roles: ["admin"],
    },
  };
  updateUserData(res, id, {roles: ["admin"]})

  if (!id) return res.status(500).end();

  const params = { id: id };
  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}


module.exports = {
  getUsers,
  getUser,
  // getLogs,

  blockUser,
  unblockUser,
  changeToUser,
  changeToGuest,
  changeToAdmin,
};
