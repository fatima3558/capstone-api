const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

const router = express.Router()

// register
router.post('/register', async (req, res, next) => {
	try {
		// check for duplicate user
		const duplicateUser = await User.findOne({phone: req.body.phone})
		if(!duplicateUser) {
			// take req.body and hash password
			const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
			req.body.password = hashedPassword
			// res.status(200).json(req.body)

			// create user
			const newUser = await User.create(req.body)
			// set session
			req.session.user = newUser
			req.session.userId = newUser._id
			req.session.username = newUser.username
			req.session.loggedIn = true

			res.status(201).json(newUser)

		} else {
			res.status(400).json({data: {}, message: "A User with that phone number already exists"})
		}
	} catch(err) {
		next(err)
	}
})

// login
router.post('/login', async (req, res, next) => {
	try {
		// check for duplicate user
		const existingUser = await User.findOne({phone: req.body.phone})		
		// if hashed passwords match, set session
		if(bcrypt.compareSync(req.body.password, existingUser.password)) {			
			// set session
			req.session.user = existingUser
			req.session.userId = existingUser._id
			req.session.username = existingUser.username
			req.session.loggedIn = true

			res.status(201).json(existingUser)
		} else {
			// send message that phone number or password was incorrect
			res.status(401).json({data: {}, message: "Phone number or password was incorrect"})
		}

	} catch(err) {
		next(err)
	}
})

// logout
router.get('/logout', (req, res, next) => {
	req.session.destroy((err) => {
		if(err) next(err)
		else res.status(200).json({data: {}, message: "Log out successful"})
	})
})

// update account

// delete account

module.exports = router