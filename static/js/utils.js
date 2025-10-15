// Common Utility Functions
// Shared functions used across multiple tools

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.value;

    navigator.clipboard.writeText(text).then(() => {
        // Could add a toast notification here in the future
    }).catch(err => {
        console.error("Failed to copy to clipboard:", err);
    });
}
