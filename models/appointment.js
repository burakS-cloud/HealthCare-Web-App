const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    appointmentTime: {
        type:String,
        required:true
    },
    appointmentSection: {
        type: Schema.Types.ObjectId,
        ref:'Doctor'
    },
    appointmentOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    appointmentDoctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    }
});

module.exports = mongoose.model("Appointment", appointmentSchema);

