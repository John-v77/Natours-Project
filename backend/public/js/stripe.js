import axios from 'axios';
import { showAlert } from './alerts';


export const bookTour = async (tourId) => {
  const stripeKey = 'pk_test_51LagyFKqlaZolGZSJ6smj6Hd5kuBZiFOOYh48kH9oeVrm2Y5JNEQegqycqsjfQT8vTKPmjVr7VOwVl2Sg2CSgBbm0057LsLuVF';
  const stripe = Stripe(stripeKey);

  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert(
      'error',
      err
    );
  }
}