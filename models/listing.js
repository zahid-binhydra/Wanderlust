const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Review = require("./review.js")

const listningSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1782064230154-ba47c8714d9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1782064230154-ba47c8714d9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
        },
    },
    price: Number,
    location: String,
    country: String,
    category: {
    type: String,
    enum: [
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Mountains",
        "Castles",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctic",
        "Domes",
        "Boats"
    ]
},
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    },
],
owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    },
})

listningSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in: listing.reviews}})
    }
})

const Listing = mongoose.model("Listing", listningSchema)
module.exports = Listing