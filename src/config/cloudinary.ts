export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const isConfigured = 
    cloudName && 
    cloudName !== 'your_cloudinary_cloud_name' && 
    uploadPreset && 
    uploadPreset !== 'your_cloudinary_upload_preset';

  if (!isConfigured) {
    console.log("Cloudinary configuration missing. Encoding image to local base64 string.");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as data URL"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // Live Cloudinary direct unsigned upload
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary live upload failed. Falling back to local Base64.", error);
    // Dynamic fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });
  }
};
