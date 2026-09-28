const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs")
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner")
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings")
    }
    console.log(listing)
    res.render("listings/show.ejs", { listing })
}

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send()


    let url = req.file.path
    let filename = req.file.filename
    let listing = req.body.listing
    listing.image = { filename: "listingimage", url: listing.image }
    const newListing = new Listing(listing)
    newListing.owner = req.user._id
    newListing.image = { url, filename }

    newListing.geometry = (response.body.features[0].geometry)
    let savedListing = await newListing.save()
    console.log(savedListing)
    req.flash("success", "New Listing Created!")
    res.redirect("/listings")
}

module.exports.editListing = async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id)
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings")
    }
    let originalImageUrl = listing.image.url
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl })
}
module.exports.updateListing = async (req, res) => {
    let { id } = req.params

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    )

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings")
    }

    // Update map coordinates using the listing's location and country
    if (listing.location && listing.country) {
        const response = await geocodingClient.forwardGeocode({
            query: `${listing.location}, ${listing.country}`,
            limit: 1
        }).send()

        if (response.body.features.length > 0) {
            listing.geometry = response.body.features[0].geometry
        }
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path
        let filename = req.file.filename

        listing.image = { url, filename }
    }

    await listing.save()

    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params
    let deletedListing = await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    req.flash("success", " Listing Deleted!")
    res.redirect("/listings")
}