// PayPal 訂單連結資訊
export type PayPalLink = {
  href: string;
  rel: 'self' | 'approve' | 'capture' | string;
  method: string;
};

// 建立訂單後的回傳資料
export type PayPalCreateOrderResponse = {
  id: string;
  status: string;
  links: PayPalLink[];
};

// capture 結果（可再擴充細節）
export type PayPalCaptureOrderResponse = {
  id: string;
  status: string;
  purchase_units: unknown[]; // 你可以根據需要定義更精確型別
};

// 回傳給前端的資料型別
export type PayPalOrderResult = {
  orderId: string;
  approveLink: string;
};
