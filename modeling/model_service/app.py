from flask import Flask
from flask_cors import CORS
from predict import call_taxi_model, call_subway_model

app = Flask(__name__)

CORS(app, resources={
    r"/taxi": {"origins": "https://clearpath.info.gf"},
    r"/subway": {"origins": "https://clearpath.info.gf"}
})

@app.route('/taxi', methods=['GET'])
def taxi_api():
    return call_taxi_model()

@app.route('/subway', methods=['GET'])
def subway_api():
    return call_subway_model()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
