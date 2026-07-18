export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayOptions {
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export const initializeRazorpayPayment = async (
  options: Omit<RazorpayOptions, 'key'>
): Promise<{ success: boolean; error?: string; paymentId?: string }> => {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  console.log("Razorpay Initialization Debug:", {
    keyIdFromEnv: keyId,
    envKeys: Object.keys(import.meta.env),
    envValues: import.meta.env
  });
  const isKeyConfigured = keyId && keyId.trim() !== '' && keyId !== 'your_razorpay_key_id';

  if (!isKeyConfigured) {
    console.log("Razorpay Key ID not configured. Using Mock Payment Dialog.");
    return new Promise((resolve) => {
      // Simulate Razorpay Overlay UI
      const mockOverlay = document.createElement('div');
      mockOverlay.style.position = 'fixed';
      mockOverlay.style.top = '0';
      mockOverlay.style.left = '0';
      mockOverlay.style.width = '100vw';
      mockOverlay.style.height = '100vh';
      mockOverlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
      mockOverlay.style.display = 'flex';
      mockOverlay.style.alignItems = 'center';
      mockOverlay.style.justifyContent = 'center';
      mockOverlay.style.zIndex = '99999';
      mockOverlay.style.fontFamily = "'Outfit', sans-serif";

      const mockModal = document.createElement('div');
      mockModal.style.backgroundColor = '#ffffff';
      mockModal.style.padding = '32px';
      mockModal.style.borderRadius = '16px';
      mockModal.style.width = '100%';
      mockModal.style.maxWidth = '420px';
      mockModal.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
      mockModal.style.border = '1px solid #e3decb';
      mockModal.style.textAlign = 'center';

      mockModal.innerHTML = `
        <div style="margin-bottom: 20px; display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background-color: #f5f1e8; border: 1px solid #c5a86d;">
          <span style="font-size: 28px; color: #1e3f20;">🌾</span>
        </div>
        <h3 style="color: #1e3f20; font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 8px;">Secure Payment Portal</h3>
        <p style="font-size: 14px; color: #6e6e6e; margin-bottom: 24px;">This is a simulated secure check-out portal. In production, this opens Razorpay's checkout interface.</p>
        
        <div style="background-color: #fcfbf9; border: 1px solid #e3decb; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
            <span style="color: #6e6e6e;">Payable Amount:</span>
            <strong style="color: #1e3f20;">₹${(options.amount / 100).toFixed(2)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color: #6e6e6e;">Customer:</span>
            <span style="color: #2b2b2b; font-weight: 500;">${options.prefill.name}</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="mock-cancel-btn" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #1e3f20; color: #1e3f20; font-weight: 500; cursor: pointer; transition: background 0.2s;">Cancel</button>
          <button id="mock-success-btn" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #1e3f20; background-color: #1e3f20; color: #ffffff; font-weight: 500; cursor: pointer; transition: background 0.2s;">Pay Success</button>
        </div>
      `;

      mockOverlay.appendChild(mockModal);
      document.body.appendChild(mockOverlay);

      const cleanup = () => {
        document.body.removeChild(mockOverlay);
      };

      document.getElementById('mock-cancel-btn')?.addEventListener('click', () => {
        cleanup();
        if (options.modal?.ondismiss) options.modal.ondismiss();
        resolve({ success: false, error: "Payment dismissed by user." });
      });

      document.getElementById('mock-success-btn')?.addEventListener('click', () => {
        cleanup();
        const payId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
        options.handler({
          razorpay_payment_id: payId,
          razorpay_order_id: 'order_mock_' + Math.random().toString(36).substr(2, 9),
          razorpay_signature: 'sig_mock_' + Math.random().toString(36).substr(2, 9)
        });
        resolve({ success: true, paymentId: payId });
      });
    });
  }

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return { success: false, error: "Failed to load Razorpay SDK." };
  }

  return new Promise((resolve) => {
    try {
      const razorpayOptions: any = {
        key: keyId,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description,
        image: options.image || '/logo.jpg', // Fallback logo
        prefill: options.prefill,
        notes: options.notes,
        theme: options.theme || { color: '#1e3f20' },
        handler: (response: any) => {
          options.handler(response);
          resolve({ success: true, paymentId: response.razorpay_payment_id });
        },
        modal: {
          ondismiss: () => {
            if (options.modal?.ondismiss) options.modal.ondismiss();
            resolve({ success: false, error: "Payment window closed." });
          }
        }
      };

      const rzp = new (window as any).Razorpay(razorpayOptions);
      rzp.on('payment.failed', function (resp: any) {
        resolve({ success: false, error: resp.error.description });
      });
      rzp.open();
    } catch (err: any) {
      resolve({ success: false, error: err.message || "Failed to initialize Razorpay checkout." });
    }
  });
};
