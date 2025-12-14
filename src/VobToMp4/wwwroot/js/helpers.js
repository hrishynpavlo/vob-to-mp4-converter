
window.getFiles = async function (input) {
    const files = input.files;
    let results = [];

    for (let file of files) {
        const arrayBuffer = await file.arrayBuffer();
        results.push({
            name: file.name,
            stream: new Uint8Array(arrayBuffer)
        });
    }

    return results;
};

window.downloadFile = (bytes, type, filename) => {
    const blob = new Blob([bytes], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};
