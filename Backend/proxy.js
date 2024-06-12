const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5044;

app.use(bodyParser.json());
app.use(cors());

// Generate random OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
let otpStore ;

app.post('/register', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const otp = generateOTP();
    console.log(`Generated OTP for ${phoneNumber}: ${otp}`); // Debugging line

    const url = 'https://api.afromessage.com/api/challenge';
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiNVpudENEVmF4ZGdXOWozdjdGQUNXYTVVeUY0YUNNYjciLCJleHAiOjE4NzU2NDA3OTIsImlhdCI6MTcxNzg3NDM5MiwianRpIjoiNDc2NTZkMGQtZTk5Zi00NzY5LTg2YzYtYmMzNmNjZTM2MzI0In0.Tdg_N59lbVzQ8P5-LRkFani_KDOQ3X6EhTIouch6VJs'; // Replace with a valid token
    const from = 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164';
    const sender = '';
    const to = phoneNumber;
    const message = `Your OTP for registration is: ${otp}`;

    const requestUrl = `${url}?from=${from}&sender=${sender}&to=${to}&message=${encodeURIComponent(message)}`;
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    console.log('Sending request to:', requestUrl);

    const response = await axios.get(requestUrl, { headers });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    if (response.data.acknowledge === 'success') {
      res.json({ success: true, message: 'OTP sent successfully', data: response.data });
    } else {
      console.error('Error from API:', response.data);
      res.status(500).json({ success: false, message: 'Failed to send OTP', error: response.data });
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});

app.post('/verify', (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    otpStore= otp;
    console.log(`Received verification request for phone number: ${phoneNumber} with OTP: ${otp}`); // Debugging line

    console.log('Current OTP Store:', otpStore); // Debugging line

    if (otpStore === otp) {
      console.log(`OTP matched for phone number: ${phoneNumber}`); // Debugging line
      delete otpStore[phoneNumber]; // Clear OTP after successful verification
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      console.log(`Invalid OTP for phone number: ${phoneNumber}`); // Debugging line
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
