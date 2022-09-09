const mongoose = require("mongoose");

const mongopath =
  "mongodb+srv://tarunsai:Tarunsai%4012@chit-chat.d7tdq.mongodb.net/Chit-Chat?retryWrites=true";

module.exports = async () => {
  await mongoose.connect(mongopath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return mongoose;
};
