import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  condition: {
    type: String,
  },
  title: {
    type: String,
  },
  brand: {
    type: String,
  },
  price: {
    type: String,
  },
  description: {
    type: String,
  },
  product_type: {
    type: String,
  },
  custom_label_0: {
    type: String,
  },
});
const Car = mongoose.model("cars", carSchema);
export default Car;