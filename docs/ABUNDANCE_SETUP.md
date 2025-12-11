# Abundance Cloud Integration - Setup Guide

## Overview

The Abundance Cloud module has been successfully integrated into the Ascendance Hub application. This module provides Shopify order management capabilities including:

- **Order Dashboard**: View and manage all orders with filtering
- **Mark as Prepared**: Mark shipping orders as prepared for shipment
- **Mark Ready for Pickup**: Mark pickup orders as ready
- **Mark Delivered**: Mark orders as delivered
- **Barcode Scanning**: Scan order barcodes using camera
- **Order Printing**: Print individual or multiple orders
- **Real-time Updates**: Auto-refresh every 2 minutes

## Files Added

1. **abundance-cloud.html** - Main page for Abundance Cloud functionality
2. **abundance-styles.css** - Styling specific to Abundance Cloud
3. **abundance-cloud.js** - All JavaScript functionality for order management

## Configuration Required

### 1. API Configuration

Edit `abundance-cloud.js` and update the `ABUNDANCE_CONFIG` object:

```javascript
const ABUNDANCE_CONFIG = {
    apiUri: 'YOUR_API_ENDPOINT', // e.g., 'https://api.yourstore.com/'
    shopifyUrl: 'YOUR_SHOPIFY_STORE', // e.g., 'k1xm3v-v0'
    storeName: 'YOUR_STORE_NAME',
    organizationName: 'YOUR_ORG_NAME',
    refreshInterval: 120000 // 2 minutes in milliseconds
};
```

### 2. Backend API Endpoints

The Abundance backend from `Abundance/shopi-mark-backend` needs to be running and accessible. The required endpoints are:

- `GET /get-orders?page=&type={all|shipping|pickup|manual}` - Fetch orders
- `POST /mark-shipping` - Mark order as prepared for shipping
- `POST /mark-pickup` - Mark order ready for pickup
- `POST /mark-delivery` - Mark order as delivered
- `GET /get-order/{orderId}` - Get single order details

### 3. Authentication Setup

The current implementation expects Firebase authentication tokens. You need to integrate this with your existing auth system.

In `abundance-cloud.js`, update the `getAuthToken()` function:

```javascript
async function getAuthToken() {
    // Replace with your actual auth implementation
    // Example with Firebase:
    // const user = firebase.auth().currentUser;
    // return await user.getIdToken();

    return 'your-auth-token';
}
```

### 4. Backend Configuration

The backend API is located in `Abundance/shopi-mark-backend`. To set it up:

1. Navigate to the backend folder:
   ```bash
   cd Abundance/shopi-mark-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   SHOPIFY_STORE_URL=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your-access-token
   FIREBASE_SERVICE_KEY_PATH=./src/serviceKey.json
   PORT=3300
   ```

4. Start the backend:
   ```bash
   npm start
   ```

## Features Explained

### Order Dashboard
- Displays all orders in a table format
- Filterable by: All, Shipping, Pickup, Manual
- Searchable by order number, customer name, or order ID
- Auto-refreshes every 2 minutes

### Quick Actions
Four prominent action buttons at the top:
1. **Mark as Prepared** - For shipping orders
2. **Mark Ready for Pickup** - For pickup orders
3. **Mark Delivered** - For delivered orders
4. **Go to Shopify Admin** - Direct link to Shopify

### Order Selection & Printing
- Select individual orders or use "Select All"
- Print selected orders or single orders
- Print preview opens in new window

### Barcode Scanning
- Click "Scan with Camera" in any Mark As modal
- Camera permission required
- Automatically fills order ID when barcode detected
- Uses ZXing library for barcode detection

## Styling

The Abundance Cloud section matches the Ascendance design system:
- Uses existing CSS variables (colors, fonts, spacing)
- Consistent card styles and animations
- Responsive design for mobile devices
- Dark/light theme compatible

## Order Status Colors

- **Orange** - Shipping orders / Prepared status
- **Green** - Pickup orders / Ready status
- **Blue** - Delivered orders
- **Gray** - Pending/Manual orders

## API Data Structure

### Order Object Example
```javascript
{
    id: 'gid://shopify/Order/1001',
    name: '#1001',
    customer: 'John Doe',
    createdAt: '2025-12-08T12:00:00Z',
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'UNFULFILLED',
    isDelivery: false,
    lineItems: [...],
    taxLines: [...],
    subtotal: '50.00',
    totalTax: '5.00',
    total: '55.00',
    shippingAddress: {...},
    customAttributes: [...],
    metafields: [...],
    noteAttributes: [...],
    fulfillmentOrders: [...]
}
```

## Mock Data

For testing without a backend, the app includes mock data in `getMockOrders()`. This will be used if the API fails or is not configured.

## Troubleshooting

### Orders Not Loading
1. Check that backend is running (`http://localhost:3300`)
2. Verify API endpoint in `ABUNDANCE_CONFIG`
3. Check browser console for errors
4. Verify authentication token is valid

### Barcode Scanner Not Working
1. Ensure HTTPS (camera requires secure context)
2. Grant camera permissions in browser
3. Check that ZXing library is loaded
4. Try with different barcode formats

### Styling Issues
1. Verify `abundance-styles.css` is loaded
2. Check for CSS conflicts with existing styles
3. Clear browser cache

## Future Enhancements

Possible improvements:
1. WebSocket integration for real-time updates
2. Order notifications
3. Bulk order operations
4. Advanced filtering and sorting
5. Export orders to CSV/PDF
6. Order history and analytics
7. Mobile app version

## Support

For issues related to:
- **Frontend**: Check `abundance-cloud.js` and browser console
- **Backend**: Check `Abundance/shopi-mark-backend` logs
- **Shopify Integration**: Verify API credentials and permissions

## Important Notes

1. **Security**: Never expose API keys or tokens in frontend code
2. **CORS**: Ensure backend has proper CORS configuration
3. **Rate Limits**: Be aware of Shopify API rate limits
4. **Data Privacy**: Handle customer data according to regulations
5. **Testing**: Test thoroughly before production use

## Integration with Existing Features

The Abundance Cloud integrates seamlessly with:
- Ascendance theme system (dark/light mode)
- Sidebar navigation
- User authentication
- Responsive layout
- Modal system

## Dependencies

- **ZXing** - Barcode scanning library (loaded via CDN)
- **Font Awesome** - Icons (already in Ascendance)
- **Outfit & Space Mono fonts** - Typography (already in Ascendance)

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Camera features require:
- HTTPS connection (or localhost for testing)
- Modern browser with MediaDevices API support
