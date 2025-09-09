const Tour = require('../models/tourModel');
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const factory = require('../controllers/handlerFactory');

const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    metadata: {
      userId: req.user.id.toString(),
      tourId: req.params.tourId,
      price: tour.price.toString()
    },

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // price in cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        },
        quantity: 1
      }
    ]

  });

  // 3) Create session as response
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .json({
      status: 'success',
      session
    })
})


const webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Extract booking data from session metadata
    const { userId, tourId, price } = session.metadata;
    
    // Create booking in database
    await Booking.create({
      tour: tourId,
      user: userId,
      price: parseInt(price),
      paid: true
    });
  }

  res.status(200).json({ received: true });
})


const createBooking = factory.createOne(Booking);
const getBooking = factory.getOne(Booking);
const getAllBookings = factory.getAll(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);



module.exports = {
  getCheckoutSession,
  webhookCheckout,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking
}