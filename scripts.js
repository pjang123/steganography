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
            document.getElementById('encodedImage').src = encodedImage;
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function stringToBinary(str) {
    return str.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}
