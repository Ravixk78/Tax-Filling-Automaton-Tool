import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, accountantRepository } from '../repositories';
import { logActivity } from '../helpers/auditLogger';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'tfat_super_secure_jwt_secret_key_2026';

export async function register(req: Request, res: Response) {
  try {
    const { Name, Email, PhoneNumber, Password, Role, LicenseNumber } = req.body;

    if (!Name || !Email || !PhoneNumber || !Password || !Role) {
      return res.status(400).json({ error: 'All fields (Name, Email, PhoneNumber, Password, Role) are mandatory' });
    }

    const existingUser = await userRepository.findByEmail(Email);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email address already exists' });
    }

    // If accountant role, license number is mandatory
    if (Role === 'Accountant' && !LicenseNumber) {
      return res.status(400).json({ error: 'Professional license number is mandatory for accountants' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const user = await userRepository.create({
      Name,
      Email,
      PasswordHash: hashedPassword,
      PhoneNumber,
      Role,
      Status: 'Active'
    });

    // If role is accountant, also create in accountant table
    if (Role === 'Accountant') {
      await accountantRepository.create({
        Name,
        Email,
        PhoneNumber,
        LicenseNumber: LicenseNumber || `MOCK-LIC-${Date.now()}`
      });
    }

    await logActivity(user.UserID, 'Account registration successful', req.ip);

    // Generate JWT right away for automatic login
    const token = jwt.sign({ UserID: user.UserID, Email: user.Email, Role: user.Role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        UserID: user.UserID,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        PhoneNumber: user.PhoneNumber,
        Status: user.Status
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userRepository.findByEmail(Email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.Status === 'Suspended') {
      return res.status(403).json({ error: 'Your account is suspended. Please contact system administration.' });
    }

    const isMatch = await bcrypt.compare(Password, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Update LastLogin timestamp
    await userRepository.update(user.UserID, { LastLogin: new Date() });

    await logActivity(user.UserID, 'User login successful', req.ip);

    // Generate token
    const token = jwt.sign(
      { UserID: user.UserID, Email: user.Email, Role: user.Role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Check if accountant details exist
    let licenseNumber = null;
    if (user.Role === 'Accountant') {
      const accountant = await accountantRepository.findByEmail(Email);
      if (accountant) licenseNumber = accountant.LicenseNumber;
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        UserID: user.UserID,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        PhoneNumber: user.PhoneNumber,
        Status: user.Status,
        LicenseNumber: licenseNumber
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = await userRepository.findById(req.user.UserID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let licenseNumber = null;
    if (user.Role === 'Accountant') {
      const accountant = await accountantRepository.findByEmail(user.Email);
      if (accountant) licenseNumber = accountant.LicenseNumber;
    }

    res.status(200).json({
      user: {
        UserID: user.UserID,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        PhoneNumber: user.PhoneNumber,
        Status: user.Status,
        CreatedDate: user.CreatedDate,
        LastLogin: user.LastLogin,
        LicenseNumber: licenseNumber
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { Name, PhoneNumber, Password } = req.body;
    const updateData: any = {};

    if (Name) updateData.Name = Name;
    if (PhoneNumber) updateData.PhoneNumber = PhoneNumber;
    if (Password) {
      updateData.PasswordHash = await bcrypt.hash(Password, 10);
    }

    const updatedUser = await userRepository.update(req.user.UserID, updateData);
    await logActivity(req.user.UserID, 'Profile updated successfully', req.ip);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        UserID: updatedUser.UserID,
        Name: updatedUser.Name,
        Email: updatedUser.Email,
        Role: updatedUser.Role,
        PhoneNumber: updatedUser.PhoneNumber,
        Status: updatedUser.Status
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
