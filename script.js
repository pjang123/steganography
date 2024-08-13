// Helper function to convert text to binary
function textToBinary(text) {
    return text.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
}

// Helper function to convert binary to text
function binaryToText(binary) {
    return binary.match(/.{1,8}/g).map(byte => {
        return String.fromCharCode(parseInt(byte, 2));
    }).join('');
}

// Encode message into image
document.getElementById('encode-button').addEventListener('click', () => {
    const fileInput = document.getElementById('encode-image');
    const message = document.getElementById('message').value;
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const binaryMessage = textToBinary(message) + '00000000'; // Add delimiter

            let dataIndex = 0;
            for (let i = 0; i < binaryMessage.length; i++) {
                const bit = binaryMessage[i];
                data[dataIndex] = (data[dataIndex] & 0xFE) | parseInt(bit);
                dataIndex += 4; // Move to the next pixel's red channel
            }

            ctx.putImageData(imageData, 0, 0);

            const encodedImg = canvas.toDataURL();
            const link = document.createElement('a');
            link.href = encodedImg;
            link.download = 'encoded-image.png';
            link.click();
        };
    };

    if (fileInput.files[0]) {
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert("Please upload an image first.");
    }
});

// Decode message from image
document.getElementById('decode-button').addEventListener('click', () => {
    const fileInput = document.getElementById('decode-image');
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let binaryMessage = '';
            for (let i = 0; i < data.length; i += 4) {
                binaryMessage += (data[i] & 1).toString();
            }

            const delimiterIndex = binaryMessage.indexOf('00000000');
            if (delimiterIndex !== -1) {
                binaryMessage = binaryMessage.slice(0, delimiterIndex);
                const decodedMessage = binaryToText(binaryMessage);
                document.getElementById('decoded-message').textContent = decodedMessage;
            } else {
                document.getElementById('decoded-message').textContent = 'No hidden message found!';
            }
        };
    };

    if (fileInput.files[0]) {
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert("Please upload an image first.");
    }
});
