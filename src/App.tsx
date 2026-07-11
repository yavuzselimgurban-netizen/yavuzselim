/// <reference types="vite/client" />
import { useEffect, useState, type FormEvent } from "react";

const paymentPackages = [
  {
    id: "paket-100",
    title: "100 TL Bağış Paketi",
    amount: 100,
    description: "Projeyi güçlü destekleyen paket.",
  },
  {
    id: "paket-50",
    title: "50 TL Bağış Paketi",
    amount: 50,
    description: "Destek olmak için uygun paket.",
  },
];

function formatMoney(amount: number) {
  return `${amount} TL`;
}

type Step = "select" | "checkout" | "redirect" | "success" | "failure";

const apiUrl = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [selectedPackageId, setSelectedPackageId] = useState(paymentPackages[0].id);
  const [step, setStep] = useState<Step>("select");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const selectedPackage = paymentPackages.find((pkg) => pkg.id === selectedPackageId)!;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const mockPayment = params.get("mockPayment");

    if (status === "success") {
      setStep("success");
      setStatusMessage("Ödemeniz başarıyla alındı. Teşekkür ederiz.");
      return;
    }

    if (status === "fail" || status === "cancel") {
      setStep("failure");
      setStatusMessage("Ödeme işlemi iptal edildi veya başarısız oldu. Lütfen tekrar deneyin.");
      return;
    }

    if (mockPayment === "true") {
      setStep("success");
      setStatusMessage("Demo için ödeme sayfasına yönlendirildiniz. Gerçek ödeme sağlayıcısı canlı olduğunda burası doğrulanacaktır.");
    }
  }, []);

  function handlePackageSelect(optionId: string) {
    setSelectedPackageId(optionId);
    setPaymentError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPaymentError("");

    if (!cardName || cardNumber.length < 12 || expiry.length < 4 || cvv.length < 3) {
      setPaymentError("Lütfen tüm kart bilgilerini doğru şekilde girin.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId: selectedPackageId }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setPaymentError(data.error || "Ödeme başlatılamadı.");
        return;
      }

      if (data.paymentUrl) {
        setStep("redirect");
        window.location.href = data.paymentUrl;
      } else {
        setPaymentError("Geçerli bir ödeme URL'si alınamadı.");
      }
    } catch (error) {
      setLoading(false);
      setPaymentError("Sunucuya bağlanırken hata oluştu.");
      console.error(error);
    }
  }

  return (
    <main className="app">
      <section className="card">
        <header className="card-header">
          <h1>motoricinbagis</h1>
          <p>Motorcular için bağış kampanyası. Seçtiğiniz paketi seçin, ardından ödeme sayfasına yönlendirileceksiniz.</p>
        </header>

        {step === "select" ? (
          <div className="payment-layout">
            <div className="payment-cards">
              {paymentPackages.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={option.id === selectedPackageId ? "payment-card selected" : "payment-card"}
                  onClick={() => handlePackageSelect(option.id)}
                >
                  <strong>{option.title}</strong>
                  <p>{option.description}</p>
                  <span>{formatMoney(option.amount)}</span>
                </button>
              ))}
            </div>
            <aside className="payment-summary">
              <strong>Seçilen Paket</strong>
              <p>{selectedPackage.title}</p>
              <p>Toplam tutar: <strong>{formatMoney(selectedPackage.amount)}</strong></p>
              <button type="button" className="payment-submit" onClick={() => setStep("checkout")}>Kart Bilgilerini Gir</button>
            </aside>
          </div>
        ) : step === "checkout" ? (
          <div className="payment-layout checkout-layout">
            <form className="payment-form" onSubmit={handleSubmit}>
              <h2>Kart Bilgileri</h2>

              <p>Gerçek kart bilgileri ödeme sağlayıcısının güvenli sayfasına girilecektir.</p>

              <label className="form-field">
                Kart Üzerindeki İsim
                <input
                  type="text"
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                  placeholder="Adınız Soyadınız"
                />
              </label>

              <label className="form-field">
                Kart Numarası
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="0000 0000 0000 0000"
                />
              </label>

              <div className="form-row">
                <label className="form-field small-field">
                  Son Kullanma Tarihi
                  <input
                    type="text"
                    maxLength={5}
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value.replace(/[^0-9/]/g, ""))}
                    placeholder="MM/YY"
                  />
                </label>
                <label className="form-field small-field">
                  CVV
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="000"
                  />
                </label>
              </div>

              {paymentError && <p className="payment-message">{paymentError}</p>}

              <div className="payment-actions">
                <button type="button" className="payment-secondary" onClick={() => setStep("select")}>Geri</button>
                <button type="submit" className="payment-submit" disabled={loading}>
                  {loading ? "Ödeme Başlatılıyor..." : "Ödemeyi Tamamla"}
                </button>
              </div>
            </form>

            <aside className="payment-summary">
              <strong>Seçilen Paket</strong>
              <p>{selectedPackage.title}</p>
              <p>Toplam tutar: <strong>{formatMoney(selectedPackage.amount)}</strong></p>
              <p>Ödeme işleminiz güvenli bir ödeme sağlayıcısı sayfasında tamamlanacaktır.</p>
            </aside>
          </div>
        ) : step === "redirect" ? (
          <div className="payment-success">
            <h2>Ödeme Süreci Başlatıldı</h2>
            <p>Ödeme sayfasına yönlendiriliyorsunuz...</p>
          </div>
        ) : step === "success" ? (
          <div className="payment-success">
            <h2>Ödeme Başarılı</h2>
            <p>{statusMessage || "Ödemeniz alındı. Teşekkür ederiz."}</p>
          </div>
        ) : (
          <div className="payment-success">
            <h2>Ödeme Başarısız</h2>
            <p>{statusMessage || "Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin."}</p>
          </div>
        )}
      </section>
    </main>
  );
}
