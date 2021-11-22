const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require('../middleware');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const catchAsync = require('../utils/catchAsync');

//Create an appointment and save it to the user who created it.

router.post('/:id', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const { appointmentSection, appointmentDoctor, appointmentTime } = req.body;
        const appointment = new Appointment({ appointmentSection, appointmentDoctor, appointmentTime });
        //appointment.appointmentOwner = req.user._id;
        user.appointments.push(appointment);
        await appointment.save();
        await user.save();
        req.flash('success', 'Created new appointment!');
        //Redirecting to home page instead of 'my appointments' page for now.
        res.redirect(`/appointments/${id}`);
    }
    catch(e) {
        req.flash('error', e.message);
        res.redirect('/login');
    }
    
}))


// This post route is for the conditional rendering that i'm doing on home.ejs file's appointment form.
//If there is no user authenticated in the system, i can't send post request to '/:id', it returns
// Page Not Found error. So this route is sending post request to '/' instead, which is '/appointments'
//instead of the post route above, which sends request to '/appointments/:id'. This post route is actually
//not successfully sending a post request because i am using isLoggedIn middleware, and since there is
//no user authenticated in the system, this post request fails and it falls into that catch block to redirect me to login page

router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const { appointmentSection, appointmentDoctor, appointmentTime } = req.body;
        const appointment = new Appointment({ appointmentSection, appointmentDoctor, appointmentTime });
        //appointment.appointmentOwner = req.user._id;
        user.appointments.push(appointment);
        await appointment.save();
        await user.save();
        req.flash('success', 'Created new appointment!');
        //Redirecting to home page instead of 'my appointments' page for now.
        res.redirect(`/appointments/${id}`);
    }
    catch(e) {
        req.flash('error', e.message);
        res.redirect('/login');
    }
    
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
    //Might not need to find all appointments, since it may be finding the every appointment, even the ones this user doesn't own.
    //the appointments this user has can be reached/retrieved just by passing the user, since we already populated the user.
    //that's my guess, so appointments/indez, { user } might be enough, let's see...
    //const appointments = await Appointment.find({});
    //console.log(user.appointments);  
    res.render('appointments/index', { user });
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