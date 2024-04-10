const dotenv = require("dotenv");
const program = require("../utils/comander.js");

const { mode } = program.opts();

dotenv.config({
    path: mode === "produccion" ? "./env.produccion" : "./.env.desarrollo"
});

const configObject = {
    mongo_url: process.env.MONGO_URL,
    admin_email: process.env.ADMIN_EMAIL,
    admin_password: process.env.ADMIN_PASSWORD,
    nodemail: process.env.NODEMAILER_EMAIL,
    nodepass:  process.env.NODEMAILER_PASSWORD
};

module.exports = configObject;
