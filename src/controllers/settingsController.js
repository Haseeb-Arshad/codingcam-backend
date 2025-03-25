const User = require('../models/User');
const bcrypt = require('bcrypt');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Pinata configuration
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretKey = process.env.PINATA_SECRET_KEY;

class SettingsController {
  static async getUserSettings(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        settings: {
          emailNotifications: user.settings?.emailNotifications ?? true,
          desktopNotifications: user.settings?.desktopNotifications ?? true,
          theme: user.settings?.theme ?? 'light',
          language: user.settings?.language ?? 'en',
          locationTracking: user.settings?.locationTracking ?? false
        },
        profile: {
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          country: user.country,
          timezone: user.timezone,
          location: user.location
        }
      });
    } catch (error) {
      console.error('Error getting user settings:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateUserSettings(req, res) {
    try {
      const userId = req.user.id;
      const {
        settings,
        profile,
        currentPassword,
        newPassword
      } = req.body;

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update settings if provided
      if (settings) {
        user.settings = {
          ...user.settings,
          ...settings
        };
      }

      // Update profile if provided
      if (profile) {
        // Update basic profile fields
        user.fullName = profile.fullName || user.fullName;
        user.country = profile.country || user.country;
        user.timezone = profile.timezone || user.timezone;
        
        // Handle profile picture separately
        if (profile.profilePicture && profile.profilePicture !== user.profilePicture) {
          try {
            if (profile.profilePicture.startsWith('data:image')) {
              // It's a new base64 image, upload to Pinata
              // Check image size before uploading - base64 is ~33% larger than the binary
              const base64Size = profile.profilePicture.length * 0.75; // Approximate binary size in bytes
              const maxSizeMB = 5;
              const maxSizeBytes = maxSizeMB * 1024 * 1024;
              
              if (base64Size > maxSizeBytes) {
                return res.status(400).json({ 
                  message: `Image size too large. Maximum size is ${maxSizeMB}MB.` 
                });
              }
              
              const imageUrl = await SettingsController.uploadImageToPinata(profile.profilePicture, userId);
              user.profilePicture = imageUrl;
            } else {
              // It's a URL, just update it directly
              user.profilePicture = profile.profilePicture;
            }
          } catch (error) {
            console.error('Error processing profile picture:', error);
            return res.status(400).json({ 
              message: 'Failed to process profile picture',
              error: error.message
            });
          }
        }

        // Update location if provided
        if (profile.location) {
          user.location = {
            ...user.location,
            ...profile.location,
            lastUpdated: new Date()
          };
        }
      }

      // Handle password change if both current and new passwords are provided
      if (currentPassword && newPassword) {
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }

      await user.save();

      // Return updated user data without sensitive information
      const updatedUser = await User.findById(userId).select('-password');

      return res.status(200).json({
        message: 'Settings updated successfully',
        settings: updatedUser.settings,
        profile: {
          email: updatedUser.email,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          profilePicture: updatedUser.profilePicture,
          country: updatedUser.country,
          timezone: updatedUser.timezone,
          location: updatedUser.location
        }
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async updateLocation(req, res) {
    try {
      const userId = req.user.id;
      const { coordinates } = req.body;

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.settings.locationTracking) {
        return res.status(400).json({ message: 'Location tracking is disabled' });
      }

      user.location = {
        type: 'Point',
        coordinates,
        enabled: true,
        lastUpdated: new Date()
      };

      await user.save();

      return res.status(200).json({
        message: 'Location updated successfully',
        location: user.location
      });
    } catch (error) {
      console.error('Error updating location:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Helper method to upload an image to Pinata
  static async uploadImageToPinata(base64Image, userId) {
    try {
      // Extract the actual base64 data from the data URL
      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format');
      }
      
      const type = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      
      // Resize image if it's too large
      // We'll continue with the original image for now, but could add image processing here
      
      // Determine file extension from mime type
      const extension = type.split('/')[1];
      const fileName = `profile_${userId}_${Date.now()}.${extension}`;
      const tempFilePath = path.join(os.tmpdir(), fileName);
      
      // Write the buffer to a temp file
      fs.writeFileSync(tempFilePath, buffer);
      
      // Create form data for Pinata
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempFilePath));
      
      // Add metadata
      const metadata = JSON.stringify({
        name: fileName,
        keyvalues: {
          userId,
          type: 'profile',
          timestamp: Date.now()
        }
      });
      formData.append('pinataMetadata', metadata);
      
      // Set pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', pinataOptions);
      
      // Upload to Pinata
      try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
          maxBodyLength: Infinity,
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretKey
          }
        });
        
        // Clean up the temp file
        fs.unlinkSync(tempFilePath);
        
        // Return the gateway URL
        const ipfsHash = response.data.IpfsHash;
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      } catch (uploadError) {
        // Clean up the temp file in case of error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        console.error('Pinata upload error:', uploadError.response?.data || uploadError.message);
        throw new Error(`Failed to upload to IPFS: ${uploadError.message}`);
      }
    } catch (error) {
      console.error('Error uploading image to Pinata:', error);
      throw new Error('Failed to process image for upload');
    }
  }
}

module.exports = { SettingsController }; 