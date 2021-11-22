const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require('../middleware');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const catchAsync = require('../utils/catchAsync');

//Create an appointment and save it to the user who created it.

router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    const appointment = new Appointment(req.body.appointment);
    appointment.appointmentOwner = req.user._id;
    user.appointments.push(appointment);
    await appointment.save();
    await user.save();
    req.flash('success', 'Created new appointment!');
    //Redirecting to home page instead of 'my appointments' page for now.
    res.redirect(`/`);
}))

// Get all the appointments for a specific user.

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    //currentUser
    const user = await User.findById(req.params.id).populate({
        path:'appointments',
        populate: {
            path: 'appointmentOwner'
        }
    });
    const appointments = await Appointment.find({});
    console.log(user);
    try {
        if(user.appointments){
            res.render('appointments/index', { user, appointments });
        }
    }
    catch(e) {
        console.log('Something went wrong!');
        console.log(e);
    }
    
    //const appointments = await Appointment.find({}); 
}));

router.delete('/:appointmentId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, appointmentId } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { appointments: appointmentId } });
    await Appointment.findByIdAndDelete(appointmentId);
    req.flash('success', 'Successfully deleted the appointment')
    res.redirect(`/appointments/${id}`);
}))

module.exports = router;