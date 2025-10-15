// Hash Generator Tool Functions

function generateHashes() {
    const input = document.getElementById("hash-input").value;
    if (!input.trim()) {
        // TODO: create notification system
        alert("Please enter some text to generate hashes");
        return;
    }

    fetch("/api/generator/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
    })
    .then(response => response.json())
    .then(data => {
        if (data.hashes) {
            document.getElementById("md5-result").value = data.hashes.MD5;
            document.getElementById("sha1-result").value = data.hashes.SHA1;
            document.getElementById("sha256-result").value = data.hashes.SHA256;
            document.getElementById("sha512-result").value = data.hashes.SHA512;
            document.getElementById("hash-results").classList.remove("hidden");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        // TODO: create notification system
        alert("Error generating hashes");
    });
}