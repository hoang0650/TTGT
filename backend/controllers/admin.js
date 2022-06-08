const ManagementClient = require("auth0").ManagementClient;
const UserGroup = require('../models/userGroup');
const config = require("../config/configure");
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

  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

function changeToQuest(req, res) {
  const data = {
    app_metadata: {
      roles: ["guest"],
    },
  };
  const id = req.params.id;
  if (!id) return res.status(500).end();
  const params = { id: id };
  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

function changeToUser(req, res) {
  const data = {
    app_metadata: {
      roles: ["user"],
    },
  };
  const id = req.params.id;
  if (!id) return res.status(500).end();
  const params = { id: id };
  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

function changeToAdmin(req, res) {
  const data = {
    app_metadata: {
      roles: ["admin"],
    },
  };
  const id = req.params.id;
  if (!id) return res.status(500).end();
  const params = { id: id };
  management
    .updateUser(params, data)
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).end(err.message));
}

// function getLogs(req,res){
//   const id = req.params.id;
//   if (!id) return res.status(500).end();
//   const params = {
//     id: id,
//     q: `description:"user is blocked"`,
//   };

//   management
//   .getLog(params)
//   .then((user)=>{
//     res.status(200).json({user})
//   }).catch((err)=>{
//     res.status(500).json({err})
//   })

// }


module.exports = {
  getUsers,
  getUser,
  // getLogs,

  blockUser,
  unblockUser,
  changeToUser,
  changeToQuest,
  changeToAdmin,
};
