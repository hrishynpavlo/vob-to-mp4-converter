
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

window.triggerDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
