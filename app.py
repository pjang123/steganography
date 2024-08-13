from PIL import Image

def encode_image(image_path, message):
    image = Image.open(image_path)

    if image.mode != 'RGB':
        image = image.convert('RGB')

    encoded_image = image.copy()
    width, height = image.size
    index = 0


    # Convert message to binary
    binary_message = ''.join([format(ord(i), '08b') for i in message])
    binary_message += '1111111111111110'  # End of message delimiter

    for row in range(height):
        for col in range(width):
            if index < len(binary_message):
                pixel = list(image.getpixel((col, row)))
                # Modify the least significant bit of the red channel
                pixel[0] = int(format(pixel[0], '08b')[:-1] + binary_message[index], 2)
                encoded_image.putpixel((col, row), tuple(pixel))
                index += 1
            else:
                break

    return encoded_image

def decode_image(image_path):
    image = Image.open(image_path)
    binary_message = ''
    width, height = image.size

    for row in range(height):
        for col in range(width):
            pixel = image.getpixel((col, row))
            binary_message += format(pixel[0], '08b')[-1]

    # Convert binary message to string
    all_bytes = [binary_message[i:i+8] for i in range(0, len(binary_message), 8)]
    decoded_message = ''.join([chr(int(byte, 2)) for byte in all_bytes])

    return decoded_message.split('1111111111111110')[0]

from flask import Flask, render_template, request, send_file
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/encode', methods=['POST'])
def encode():
    image = request.files['image']
    message = request.form['message']

    # Save the uploaded image
    image_path = 'static/uploads/' + image.filename
    image.save(image_path)

    # Encode the message into the image
    encoded_image = encode_image(image_path, message)
    encoded_image_path = 'static/uploads/encoded_' + image.filename
    encoded_image.save(encoded_image_path)

    return send_file(encoded_image_path, as_attachment=True)

@app.route('/decode', methods=['POST'])
def decode():
    image = request.files['image']

    # Save the uploaded image
    image_path = 'static/uploads/' + image.filename
    image.save(image_path)

    # Decode the message from the image
    decoded_message = decode_image(image_path)

    return decoded_message

if __name__ == '__main__':
    if not os.path.exists('static/uploads'):
        os.makedirs('static/uploads')
    app.run(debug=True)
