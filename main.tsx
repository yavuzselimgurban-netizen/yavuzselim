import "/src/lang/index.ts";
import "/src/lib/env.ts";
import "/src/index.css";

const rootElement = document.getElementById("root");

const paymentPackages = [
	{
		id: "paket-100",
		title: "100 TL Bağış Paketi",
		amount: 100,
		description: "Bu paketin seçimi, projeyi güçlü bir şekilde destekler.",
	},
	{
		id: "paket-50",
		title: "50 TL Bağış Paketi",
		amount: 50,
		description: "Bu paket, destek olmak için ideal bir seçenektir.",
	},
];

function formatMoney(amount) {
	return `${amount} TL`;
}

function createPackageCard(option, selectedId) {
	const card = document.createElement("button");
	card.type = "button";
	card.className = "payment-card" + (option.id === selectedId ? " selected" : "");
	card.dataset.packageId = option.id;
	card.innerHTML = `
		<strong>${option.title}</strong>
		<p>${option.description}</p>
		<span>${formatMoney(option.amount)}</span>
	`;
	return card;
}

function renderPaymentApp() {
	if (!rootElement) {
		return;
	}

	rootElement.innerHTML = `
		<div class="payment-app">
			<h1>Bağış Paketleri</h1>
			<p>Lütfen desteklemek istediğiniz paketi seçin ve ödemenizi tamamlayın.</p>
			<div class="payment-cards"></div>
			<div class="payment-summary"></div>
			<button class="payment-submit">Ödeme Yap</button>
		</div>
	`;

	const style = document.createElement("style");
	style.textContent = `
		.payment-app { max-width: 600px; margin: 32px auto; padding: 24px; background: #fff; border-radius: 18px; box-shadow: 0 16px 34px rgba(0,0,0,0.08); font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; color: #1c1c1e; }
		.payment-app h1 { margin: 0 0 12px; font-size: 2rem; }
		.payment-app p { margin: 0 0 24px; line-height: 1.6; }
		.payment-cards { display: grid; gap: 16px; }
		.payment-card { text-align: left; padding: 18px; border: 2px solid #d1d5db; border-radius: 16px; background: #f8fafc; cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease; }
		.payment-card.selected { border-color: #2563eb; background: #eff6ff; }
		.payment-card strong { display: block; font-size: 1.1rem; margin-bottom: 8px; }
		.payment-card p { margin: 0 0 12px; color: #4b5563; }
		.payment-card span { font-weight: 700; color: #111827; }
		.payment-summary { margin-top: 24px; padding: 18px; border-radius: 16px; background: #eef2ff; border: 1px solid #c7d2fe; }
		.payment-summary strong { display: block; margin-bottom: 8px; font-size: 1rem; }
		.payment-submit { margin-top: 20px; width: 100%; padding: 14px 18px; font-size: 1rem; font-weight: 700; color: #fff; background: #2563eb; border: none; border-radius: 14px; cursor: pointer; transition: background 0.2s ease; }
		.payment-submit:hover { background: #1d4ed8; }
	`;

	document.head.appendChild(style);

	const cardsContainer = rootElement.querySelector(".payment-cards");
	const summaryContainer = rootElement.querySelector(".payment-summary");
	const submitButton = rootElement.querySelector(".payment-submit");

	let selectedPackageId = paymentPackages[0].id;

	function updateSummary() {
		const selectedPackage = paymentPackages.find((item) => item.id === selectedPackageId);
		if (!selectedPackage || !summaryContainer) return;
		summaryContainer.innerHTML = `
			<strong>Seçilen Paket:</strong>
			<p>${selectedPackage.title}</p>
			<p>Toplam tutar: <strong>${formatMoney(selectedPackage.amount)}</strong></p>
		`;
	}

	function renderCards() {
		if (!cardsContainer) return;
		cardsContainer.innerHTML = "";
		paymentPackages.forEach((option) => {
			const card = createPackageCard(option, selectedPackageId);
			card.addEventListener("click", () => {
				selectedPackageId = option.id;
				renderCards();
				updateSummary();
			});
			cardsContainer.appendChild(card);
		});
	}

	renderCards();
	updateSummary();

	if (submitButton) {
		submitButton.addEventListener("click", () => {
			const selectedPackage = paymentPackages.find((item) => item.id === selectedPackageId);
			if (!selectedPackage) return;
			window.alert(`Seçilen paket: ${selectedPackage.title}\nÖdenecek tutar: ${formatMoney(selectedPackage.amount)}\nÖdeme sayfasına yönlendiriliyorsunuz...`);
		});
	}
}

renderPaymentApp();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBQUEsT0FBTztBQUNQLE9BQU87QUFDUCxPQUFPO0FBQ1AsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxZQUFZLG1CQUFtQjtBQUN4QyxTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTOzs7QUFFaEIsTUFBTSxjQUFjLFNBQVMsZUFBZSxNQUFNO0FBQ2xELE1BQU0sT0FDSix3QkFBQyxZQUFEO0NBQVU7Q0FBQTtDQUFBO0NBQUE7Q0FBQTtDQUFBO1dBQVYsQ0FDRSx3QkFBQyxLQUFEO0VBQUk7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0NBQUU7Ozs7V0FDTix3QkFBQyxTQUFEO0VBQVE7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0NBQUU7Ozs7U0FDQTs7Ozs7Ozs7QUFLZCxJQUFJLFlBQVksY0FBYyxHQUFHO0NBQy9CLFlBQVksYUFBYSxJQUFJO0FBQy9CLE9BQU87Q0FDTCxXQUFXLFdBQVcsQ0FBQyxDQUFDLE9BQU8sSUFBSTtBQUNyQyIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibWFpbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiLi9sYW5nXCI7XG5pbXBvcnQgXCIuL2xpYi9lbnZcIjtcbmltcG9ydCBcIi4vaW5kZXguY3NzXCI7XG5pbXBvcnQgeyBTdHJpY3RNb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjcmVhdGVSb290LCBoeWRyYXRlUm9vdCB9IGZyb20gXCJyZWFjdC1kb20vY2xpZW50XCI7XG5pbXBvcnQgeyBUb2FzdGVyIH0gZnJvbSBcIkAvY29tcG9uZW50cy91aS9zb25uZXJcIjtcbmltcG9ydCBBcHAgZnJvbSBcIkAvQXBwLnRzeFwiO1xuXG5jb25zdCByb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKSE7XG5jb25zdCB0cmVlID0gKFxuICA8U3RyaWN0TW9kZT5cbiAgICA8QXBwIC8+XG4gICAgPFRvYXN0ZXIgLz5cbiAgPC9TdHJpY3RNb2RlPlxuKTtcblxuLy8gSHlkcmF0ZSB3aGVuIHRoZSBtYXJrdXAgd2FzIHByZXJlbmRlcmVkIChmbGFnIE9OKTsgb3RoZXJ3aXNlIGNyZWF0ZSBhIGZyZXNoXG4vLyByb290IGV4YWN0bHkgYXMgYmVmb3JlIChmbGFnIE9GRiAtPiBpZGVudGljYWwgdG8gdGhlIHByZXZpb3VzIGJlaGF2aW9yKS5cbmlmIChyb290RWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgaHlkcmF0ZVJvb3Qocm9vdEVsZW1lbnQsIHRyZWUpO1xufSBlbHNlIHtcbiAgY3JlYXRlUm9vdChyb290RWxlbWVudCkucmVuZGVyKHRyZWUpO1xufVxuIl0sImZpbGUiOiIvc2hhcmVkL3Byb2plY3RzLzg5Y2MwNDg1LTAxMTktNDFlNS05ZjdlLWI3MjkwZGYzNzA3Mi9zcmMvbWFpbi50c3gifQ==