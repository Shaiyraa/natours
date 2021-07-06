import axios from 'axios';
const stripe = Stripe('pk_test_pQ4ggB6YrNGtXEAN0a874ctD00s1u35agT');
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (err) {
    console.log(Err)
    showAlert('error', err)
  }
}