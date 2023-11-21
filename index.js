const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const fs = require('fs');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
const port = 3000;


// Use body-parser middleware to parse JSON in the request body
app.use(bodyParser.json());

// Dummy user data (replace this with your actual user data)
const registeredUsers = [
  
  // Add more users as needed
];

// Configure nodemailer with your email service provider's settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'charlesathande@gmail.com',
    pass: process.env.PASSWORD,
  },
});

// Different emails for each day
const dailyEmails = [
  'Email content for day 1',
  'Email content for day 2',
  'Email content for day 3',
  'Email content for day 4',
  'Email content for day 5',
  'Email content for day 6',
];

// Counter to keep track of the days
let dayCounter = 0;

// Function to read and write the dayCounter value to a file
const persistDayCounter = () => {
  const filename = './content/dayCounter.txt';

  try {
    // Read the current dayCounter value from the file
    const currentDayCounter = parseInt(fs.readFileSync(filename, 'utf8')) || 0;

    // Increment the dayCounter
    dayCounter = currentDayCounter + 1;

    // Write the updated dayCounter value back to the file
    fs.writeFileSync(filename, dayCounter.toString(), 'utf8');
  } catch (error) {
    console.error('Error persisting dayCounter:', error);
  }
};

// Function to send a different email to each user based on the day
const sendDailyEmails = async () => {
  // Call the function to persist the dayCounter value
  persistDayCounter();

  const day = dayCounter % dailyEmails.length;

  registeredUsers.forEach((user) => {
    // Determine the email content based on whether the user is new or existing
    const emailContent = user.lastSentDay < 6 ? dailyEmails[day] : null;

    if (emailContent) {
      const mailOptions = {
        from: 'charlesathande@gmail.com',
        to: user.email,
        subject: `Day ${day + 1} Email for ${user.name}`,
        text: `Hello ${user.name},\n\n${emailContent}\n\nRegards,\nYour App`,
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Error sending email to ${user.email}: ${error}`);
        } else {
          console.log(`Email sent to ${user.email}: ${info.response}`);
        }
      });

      // Update the user's last sent day
      user.lastSentDay = day;
    }
  });

  // Check if it's the 6th day, and if so, stop the cron job
  if (dayCounter === 6) {
    cronJob.stop();
  }
};

// Endpoint to register a new user
app.post('/register', (req, res) => {
  const newUser = {
    email: req.body.email,
    name: req.body.name,
    lastSentDay: 0,
  };

  // Add the new user to the registeredUsers array
  registeredUsers.push(newUser);

  
  

  res.json(newUser);
});

// Schedule the cron job to run at a specified time every day for 6 days
const cronJob = cron.schedule('23 10 * * *', () => {
  // Run the function to send emails
  sendDailyEmails();
}, { scheduled: false }); // Set scheduled to false to prevent immediate execution

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  // Start the cron job when the server starts
  cronJob.start();
});