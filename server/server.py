import io
import face_recognition
import numpy as np
import PIL.Image

from flask import Flask, request, jsonify
app = Flask(__name__)

# Initialize background knowledge
known_face_encodings = []
known_face_names = []

# Load an image and learn how to recognize it
def train_faces(image, label):
    new_face_encoding = face_recognition.face_encodings(image)[0]
    known_face_encodings.append(new_face_encoding)
    known_face_names.append(label)

obama_image = face_recognition.load_image_file("./images/obama.jpg")
train_faces(obama_image, "Barack Obama")

biden_image = face_recognition.load_image_file("./images/biden.jpg")
train_faces(biden_image, "Joe Biden")

def face_match(image):
    # Initialize variables
    face_locations = []
    face_encodings = []
    face_names = []

    # Find all the faces and face encodings in the current frame of video
    face_locations = face_recognition.face_locations(image)
    print(f"Detected faces at {face_locations}")
    face_encodings = face_recognition.face_encodings(image, face_locations)

    for face_encoding in face_encodings:
        # See if the face is a match for the known face(s)
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        name = "Unknown"

        # Use the known face with the smallest distance to the new face
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            name = known_face_names[best_match_index]

        face_names.append(name)
    return [face_names, face_locations]

def process_photo(photo):
    memfile = io.BytesIO()
    photo.save(memfile)
    image = np.array(PIL.Image.open(memfile).convert('RGB'))
    return image

@app.route('/')
def index():
    res = { 'result': 'success' }
    return jsonify(res)

@app.route('/labels')
def labels():
    res = { 'labels': known_face_names }
    return jsonify(res)

@app.route('/train', methods=['POST'])
def train():
    print(f"Receiving a photo labeled {request.form['label']} to learn...")

    train_faces(process_photo(request.files['photo']), request.form['label'])
    res = { 'result': 'success' }
    return jsonify(res)

@app.route('/recog', methods=['POST'])
def recog():
    print('Receiving a photo to recognize...')

    [names, locations] = face_match(process_photo(request.files['photo']))
    print(f"Recognized {names}")
    res = {'names': names, 'locations': locations }
    return jsonify(res)
