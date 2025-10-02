function fixMht() {
    const fileInput = document.getElementById("file-input");
    const outputTextArea = document.getElementById("output");
    const downloadBtn = document.getElementById("download-btn");

    if (fileInput.files.length === 0) {
        console.log("No file selected");
        return;
    }

    console.log(fileInput.files[0].slice(0, -3));

    // reading this as text is probably not the best idea for large files
    // but it's good enough for now
    const reader = new FileReader();
    reader.onload = async function(event) {
        const contents = event.target.result;
        const response = await fetch("/api/mht", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contents })
        });
        const data = await response.json();
        if (response.ok) {
            outputTextArea.textContent = data.result;
            downloadBtn.disabled = false;
            downloadBtn.onclick = function() {
                const blob = new Blob([data.result], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileInput.files[0].name.slice(0, -4) + "_fixed.html";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } else {
            // TODO: notification system?
            outputTextArea.textContent = data.msg || "An error occurred";
        }
    }
    reader.readAsText(fileInput.files[0]);
}

function generateHashes() {
    const input = document.getElementById("hash-input").value;
    if (!input.trim()) {
        // TODO: create notification system
        alert("Please enter some text to generate hashes");
        return;
    }

    fetch("/api/hash", {
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