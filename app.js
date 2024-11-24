const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); // Correct path to your listing model
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // Helps to create a common template for multiple pages

// MongoDB connection URL
const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
async function main() {
  try {
    await mongoose.connect(Mongo_Url);
    console.log("Connected to database");
  } catch (err) {
    console.log("Database connection error:", err);
  }
}
main();

// Express configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate); // Use ejsMate for templates
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Index route
app.get("/", (req, res) => {
  res.send("Hi, welcome to Wanderlust!");
});

// Route to list all listings
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// Route to show form for new listing
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show route - view a specific listing
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.send("Listing not found!");
  }
  res.render("listings/show.ejs", { listing });
});

// Create route - create a new listing
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect(`/listings/${newListing._id}`);
});

// Edit route - show form to edit listing
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.send("Listing not found!");
  }
  res.render("listings/edit.ejs", { listing });
});

// Update route - update a listing
app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

// Delete route - delete a listing
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  console.log("Listing deleted successfully");
  res.redirect("/listings");
});

// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
