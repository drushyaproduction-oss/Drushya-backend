import mongoose from 'mongoose';
import { Admin } from './src/models/admin.model.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI + '/test')
  .then(async () => {
    const admin = await Admin.findOne();
    console.log('OTP:', admin.otp);
    process.exit(0);
  });
