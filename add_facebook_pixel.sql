-- Add Facebook Pixel ID to site settings
ALTER TABLE `sitesettings` 
ADD COLUMN `facebookPixelId` VARCHAR(255) NULL AFTER `razorpayKeySecret`,
ADD COLUMN `facebookPixelEnabled` BOOLEAN DEFAULT FALSE AFTER `facebookPixelId`;

-- Update existing record to have default values (works with any ID type)
UPDATE `sitesettings` 
SET `facebookPixelId` = NULL, 
    `facebookPixelEnabled` = FALSE;
