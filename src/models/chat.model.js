const { model, Schema } = require('mongoose');


const chatSchema = new Schema({
    nombre: String,
    mensaje: String
}, {
    versionKey: false, timestamps: true,
});


module.exports = model('chat', chatSchema);