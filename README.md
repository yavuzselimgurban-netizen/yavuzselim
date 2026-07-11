# motoricinbagis

Bu proje React + Vite frontend ve Express backend içeren bir bağış sitesi.

## Yerelde Çalıştırma

1. Proje klasörüne git:
   ```powershell
   cd "c:\Users\Gaming\Downloads\MT-125 Bağış Kampanyası _ 380.000 TL Hedef_files\bagis-kampanyasi"
   ```
2. Paketleri yükle:
   ```powershell
   npm install
   ```
3. Geliştirme ortamını çalıştır:
   - Frontend: `npm run dev`
   - Backend: `npm run serve`

## Üretime Hazırlık

1. `.env.example` dosyasını `.env` olarak kopyala.
2. `.env` içine gerekli değerleri gir:
   - `PAYMENT_PROVIDER=stripe` veya `paytr`
   - Stripe kullanıyorsan:
     - `STRIPE_SECRET_KEY=sk_test_...`
     - `STRIPE_SUCCESS_URL=https://motoricinbagis.com/?status=success`
     - `STRIPE_CANCEL_URL=https://motoricinbagis.com/?status=cancel`
   - PayTR kullanıyorsan:
     - `PAYTR_MERCHANT_ID=`
     - `PAYTR_MERCHANT_KEY=`
     - `PAYTR_USER_ID=`
     - `PAYTR_MERCHANT_SALT=`
     - `PAYTR_SUCCESS_URL=https://motoricinbagis.com/?status=success`
     - `PAYTR_FAIL_URL=https://motoricinbagis.com/?status=fail`
     - `PAYTR_TEST_MODE=false`
   - `FRONTEND_ORIGIN=https://motoricinbagis.com`
   - `VITE_API_URL=https://api.motoricinbagis.com` (veya `""` aynı host için)
3. Üretim için build işlemi:
   ```powershell
   npm run build
   ```
4. Sunucuyu başlat:
   ```powershell
   npm start
   ```

## Canlıya Geçirme Notları

- Canlıda `motoricinbagis.com` gibi gerçek bir domain kullan.
- PayTR veya Stripe canlı API bilgilerini `.env` içine yaz.
- Backend aynı sunucuda çalışacaksa `VITE_API_URL` boş bırakılabilir ve API istekleri `https://motoricinbagis.com/api/create-payment` olarak çalışır.
- Node.js destekli hosting kullanmalısın (Render, Railway, Vercel Serverless, DigitalOcean App Platform, VPS vb.).

## Ödeme Akışı

- Kullanıcı paket seçer.
- Ödeme formuna yönlendirilir.
- Backend `POST /api/create-payment` ile ödeme sağlayıcısına istek atar.
- Ödeme sağlayıcısı kullanıcının kart bilgilerini alır ve başarılı/iptal URL’ye döner.
