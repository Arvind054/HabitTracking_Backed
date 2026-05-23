const { default: mongoose } = require('mongoose');
//Database Connection
dbConnection()
.then(console.log("db connected successfully"))
.catch((e)=>{console.log("error connecting DB, ", e)});
async function dbConnection(){
    await mongoose.connect(process.env.MONGODB_URL);
};

module.exports = dbConnection;