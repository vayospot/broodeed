import { create } from "twrnc";

// Load our custom tailwind config
const config = require("../../tailwind.config.js");

// Create the customized twrnc instance
const tw = create(config);

export default tw;
