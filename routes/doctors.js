const express = require('express');
const router = express.Router({ mergeParams:true });
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const { isLoggedIn } = require('../middleware');

router.get('/registerDoc', (req, res) => {
    res.render('doctors/registerDoc');
})

router.post('/registerDoc', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password, tc, phoneNumber, address, mySecretary, doctorSection } = req.body;
        const doctor = new Doctor({ email, username, tc, phoneNumber, address, mySecretary, doctorSection});
        const registeredDoctor = await Doctor.register(doctor, password);
        console.log(registeredDoctor);
        req.login(registeredDoctor, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to HealthCare Doc!');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/registerDoc');
    }
}));

router.get('/loginDoc', (req, res) => {
    res.render('doctors/loginDoc');
})

router.post('/loginDoc', passport.authenticate('doctor', { successRedirect:'/', failureFlash: true, failureRedirect: '/doctors/loginDoc' }), (req, res) => {
    req.flash('success', 'welcome back!');
    //const redirectUrl = req.session.returnTo || '/';
    //delete req.session.returnTo;
    res.redirect('/');
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
})

router.get('/:docid', isLoggedIn, catchAsync(async (req, res) => {
    const { docid } = req.params;
    const doctor = await Doctor.findById(docid).populate('patientAppointments');
    //Might not need to find all appointments, since it may be finding the every appointment, even the ones this user doesn't own.
    //the appointments this user has can be reached/retrieved just by passing the user, since we already populated the user.
    //that's my guess, so appointments/index, { user } might be enough, let's see...
    //const appointments = await Appointment.find({});  
    res.render('appointments/docindex', { doctor });
    
}));



module.exports = router;