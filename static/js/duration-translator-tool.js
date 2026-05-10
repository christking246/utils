document.addEventListener("DOMContentLoaded", () => {
    const valueInput = document.getElementById("duration-value");
    const unitSelect = document.getElementById("duration-unit");
    const convertBtn = document.getElementById("duration-translate-btn");
    const resultsSection = document.getElementById("duration-translate-results");
    const resultsValues = document.getElementById("duration-translate-values");

    function clearResults() {
        resultsSection.classList.add("hidden");
        resultsValues.innerHTML = "";
    }

    convertBtn.addEventListener("click", async () => {
        clearResults();
        const value = parseFloat(valueInput.value);
        const unit = unitSelect.value;
        if (isNaN(value) || value < 0) {
            resultsValues.innerHTML = `<span class='text-red-400'>Please enter a valid non-negative number.</span>`;
            resultsSection.classList.remove("hidden");
            return;
        }
        convertBtn.disabled = true;
        convertBtn.textContent = "Converting...";
        try {
            const res = await fetch("/api/time/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value, unit })
            });
            const data = await res.json();
            if (data.success) {
                resultsValues.innerHTML = `
                    <div class="p-3 bg-stone-700 rounded-lg mb-2">
                        <span class="text-stone-400 text-sm font-medium">Full</span>
                        <p class="text-stone-100 font-semibold mt-1">${data.full}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="p-3 bg-stone-700 rounded-lg">
                            <span class="text-stone-400 text-sm font-medium">Seconds</span>
                            <p class="text-stone-100 font-semibold mt-1">${data.seconds}</p>
                        </div>
                        <div class="p-3 bg-stone-700 rounded-lg">
                            <span class="text-stone-400 text-sm font-medium">Minutes</span>
                            <p class="text-stone-100 font-semibold mt-1">${data.minutes}</p>
                        </div>
                        <div class="p-3 bg-stone-700 rounded-lg">
                            <span class="text-stone-400 text-sm font-medium">Hours</span>
                            <p class="text-stone-100 font-semibold mt-1">${data.hours}</p>
                        </div>
                        <div class="p-3 bg-stone-700 rounded-lg">
                            <span class="text-stone-400 text-sm font-medium">Days</span>
                            <p class="text-stone-100 font-semibold mt-1">${data.days}</p>
                        </div>
                    </div>
                `;
            } else {
                resultsValues.innerHTML = `<span class='text-red-400'>${data.msg || "Conversion failed."}</span>`;
            }
            resultsSection.classList.remove("hidden");
        } catch (e) {
            resultsValues.innerHTML = `<span class='text-red-400'>Error: ${e.message}</span>`;
            resultsSection.classList.remove("hidden");
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = "Convert";
        }
    });

    valueInput.addEventListener("input", clearResults);
    unitSelect.addEventListener("change", clearResults);
});
