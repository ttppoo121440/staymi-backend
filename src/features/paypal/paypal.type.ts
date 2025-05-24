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

// 回傳給前端的資料型別
export type PayPalOrderResult = {
  orderId: string;
  approveLink: string;
};
// capture 結果（可再擴充細節）
export type PayPalCaptureOrderResponse = {
  id: string;
  status: string;
  payer?: {
    email_address?: string;
    payer_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
    address?: {
      country_code?: string;
    };
  };
  payment_source?: {
    paypal?: {
      email_address?: string;
      account_id?: string;
      account_status?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
      address?: {
        country_code?: string;
      };
    };
  };
  purchase_units?: {
    reference_id?: string;
    shipping?: {
      name?: {
        full_name?: string;
      };
      address?: {
        address_line_1?: string;
        admin_area_2?: string;
        admin_area_1?: string;
        postal_code?: string;
        country_code?: string;
      };
    };
    payments?: {
      captures?: {
        id?: string;
        status?: string;
        custom_id?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
        final_capture?: boolean;
        create_time?: string;
        update_time?: string;
        seller_protection?: {
          status?: string;
          dispute_categories?: string[];
        };
        status_details?: {
          reason?: string;
        };
      }[];
    };
  }[];
};
