from flask import Flask, jsonify, request  
import json
import os

app = Flask(__name__)

#Json route
DATA_FILE = os.path.join(os.path.dirname(__file__), "inventory.json")

#load
def load_inventory():
    with open(DATA_FILE, "r") as file:
        return json.load(file)

 #Save   
def save_inventory(data):
    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=2)   

#API running
@app.route("/")
def home():
    return "🏌️Inventory API is running"

# GET, list of product
@app.route('/products', methods=['GET'])
def get_products():
    inventory = load_inventory()
    return jsonify(inventory)

#POST, add new item
@app.route("/products", methods=["POST"])
def add_product():
    inventory = load_inventory()
    new_product = request.get_json()
    new_product["id"] = max([p["id"] for p in inventory], default=0)+1
    inventory.append(new_product)
    save_inventory(inventory)
    return jsonify(new_product),201

# PUT,update product for ID
@app.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    inventory = load_inventory()
    updated_data = request.get_json()

    # validation
    if "price" in updated_data:
        price = updated_data["price"]
        if type(price) not in [int, float]:
            return jsonify({"error": "Price must be a number."}), 400
        if price < 0:
            return jsonify({"error": "Price cannot be negative."}), 400


    if "quantity" in updated_data:
        quantity = updated_data["quantity"]
        if type(quantity) != int:
            return jsonify({"error": "Quantity must be a full number."}), 400
        if quantity < 0:
            return jsonify({"error": "Quantity must be positive."}), 400

    # Find and update
    for product in inventory:
        if product["id"] == product_id:
            product.update(updated_data)
            save_inventory(inventory)
            return jsonify(product)

    
    return jsonify({"error": "Product not found."}), 404

#Delete per ID
@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    inventory = load_inventory()
    new_inventory =[p for p in inventory if p ["id"] != product_id]

    if len(new_inventory) == len(inventory):
        return jsonify({"error":"Product not found"}), 404
    save_inventory(new_inventory)
    return jsonify({"message":"product deleted successfully"})

# Start the Flask sever
if __name__ == '__main__':
    app.run(debug=True)
