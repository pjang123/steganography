function encodeMessage() {
    const fileInput = document.getElementById('imageUpload');
    const message = document.getElementById('message').value;

    if (fileInput.files.length === 0) {
        alert('Please upload an image.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const binaryMessage = stringToBinary(message);
            const delimiter = '1111111111111110'; // End of message delimiter
            const messageBits = binaryMessage + delimiter;

            let index = 0;
            for (let i = 0; i < data.data.length && index < messageBits.length; i += 4) {
                if (index < messageBits.length) {
                    data.data[i] = (data.data[i] & 0xFE) | parseInt(messageBits[index]);
                    index++;
                }
            }

            ctx.putImageData(data, 0, 0);
            const encodedImage = canvas.toDataURL('image/png');

            // Update the displayed image
            const encodedImageElement = document.getElementById('encodedImage');
            encodedImageElement.src = encodedImage;
            encodedImageElement.style.display = 'inline'; // Make the image visible

            // Set up the download link
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = encodedImage;
            downloadLink.style.display = 'inline'; // Make the link visible

            // Show the download button
            const downloadButton = document.getElementById('downloadButton');
            downloadButton.style.display = 'inline';
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function decodeMessage() {
    const fileInput = document.getElementById('imageUploadDecode');

    if (fileInput.files.length === 0) {
        alert('Please upload an image.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const binaryMessage = extractBinaryMessage(data);

            // Convert binary message to string
            const message = binaryToString(binaryMessage);
            document.getElementById('decodedMessage').innerText = `Decoded Message: ${message}`;
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function extractBinaryMessage(data) {
    let binaryMessage = '';
    for (let i = 0; i < data.data.length; i += 4) {
        binaryMessage += (data.data[i] & 1).toString();
    }

    // Find and remove the delimiter part
    const delimiter = '1111111111111110';
    const delimiterIndex = binaryMessage.indexOf(delimiter);
    if (delimiterIndex !== -1) {
        binaryMessage = binaryMessage.slice(0, delimiterIndex);
    }
    return binaryMessage;
}

function binaryToString(binary) {
    let str = '';
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.slice(i, i + 8);
        if (byte.length === 8) {
            str += String.fromCharCode(parseInt(byte, 2));
        }
    }
    return str;
}

function stringToBinary(str) {
    return str.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

function downloadImage() {
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.click(); // Trigger the download
}
