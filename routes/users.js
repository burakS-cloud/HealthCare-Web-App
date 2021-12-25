const express = require('express');
const router = express.Router({ mergeParams:true });
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const Doctor = require('../models/doctor');
const { isLoggedIn } = require('../middleware');
const Appointment = require('../models/appointment');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password, tc, phoneNumber, address } = req.body;
        const user = new User({ name:username, email, username:email, tc, phoneNumber, address });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome HealthCare!');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('user', { successRedirect: '/', failureFlash: true, failureRedirect: '/users/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    res.redirect('/');
})

//Create an appointment and save it to the user who created it.
router.post('/:id', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        const { id } = req.params;
        const user = await User.findById(id);
        const { appointmentSection, appointmentDoctor, appointmentDate, appointmentTime } = req.body;
        
        const appointment = new Appointment({ appointmentSection, appointmentDoctor, appointmentDate, appointmentTime});
        
        for(let doc of doctors) {
            if(doc.username == appointmentDoctor){
                const theDoctor = await Doctor.findById(doc._id).populate('patientAppointments');  
                theDoctor.patientAppointments.push(appointment);
                //console.log(theDoctor);
                theDoctor.save();
                break;
            }
        }   
        user.appointments.push(appointment);
        await appointment.save();
        await user.save();
        /*appointment.populate({
            path:'appointmentSection'
        })*/
        req.flash('success', 'Created new appointment!');
        //Redirecting to home page instead of 'my appointments' page for now.
        res.redirect(`/users/${id}`);
    }
    catch(e) {
        req.flash('error', e.message);
        res.redirect('/users/login');
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
        const doctors = await Doctor.find({});
        const { id } = req.params;
        const user = await User.findById(id);
        const { appointmentSection, appointmentDoctor, appointmentDate, appointmentTime } = req.body;
        const appointment = new Appointment({ appointmentSection, appointmentDoctor, appointmentDate, appointmentTime });
        //appointment.appointmentOwner = req.user._id;
        
        user.appointments.push(appointment);
        await appointment.save();
        await user.save();
        req.flash('success', 'Created new appointment!');
        //Redirecting to home page instead of 'my appointments' page for now.
        res.redirect(`/users/${id}`);
    }
    catch(e) {
        req.flash('error', e.message);
        res.redirect('/users/login');
    }
    
}))

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
})

// Get all the appointments for a specific user.
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).populate('appointments');
    //Might not need to find all appointments, since it may be finding the every appointment, even the ones this user doesn't own.
    //the appointments this user has can be reached/retrieved just by passing the user, since we already populated the user.
    //that's my guess, so appointments/index, { user } might be enough, let's see...
    //const appointments = await Appointment.find({});  
    res.render('appointments/index', { user });
    
}))

//We will see what we'll do with this

/*router.delete('/:appointmentId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, appointmentId } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { appointments: appointmentId } });
    await Appointment.findByIdAndDelete(appointmentId);
    req.flash('success', 'Successfully deleted the appointment')
    res.redirect(`/appointments/${id}`);
}))*/



module.exports = router;