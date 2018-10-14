const fs = require('fs');

users_raw = fs.readFileSync('users.json')
users = JSON.parse(users_raw)

// console.log(users)
// console.log(typeof(users))

users.addUser =  function(username,password) {
    console.log('calling adduser');
    var blen = users.length;
    var user = {"username":username,"password":password};
    users.push(user)
    var userobj = JSON.stringify(users);
    
    fs.writeFile('users.json',userobj,'utf8',(err)=>{
        console.log('err is : ', err);
        if(err){
            console.log('error in creating user');
        }
        console.log('user created');
    })
}

module.exports = users