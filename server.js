const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1,
    name: "iPhone 13",
    price: 2999,
    oldPrice: 3499,
    image: "https://via.placeholder.com/300",
    store: "Apple Store"
  },
  {
    id: 2,
    name: "Nike Air Max",
    price: 499,
    oldPrice: 699,
    image: "https://via.placeholder.com/300",
    store: "Nike"
  },
  {
    id: 3,
    name: "PlayStation 5",
    price: 2399,
    oldPrice: 2699,
    image: "https://via.placeholder.com/300",
    store: "Sony"
  }
];

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.listen(3001, () => {
  console.log("API działa na http://localhost:3001");
});