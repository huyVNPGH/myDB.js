require('dotenv').config();

const MainClient = require('./MainClient');

const Main = new MainClient();

Main.start(process.env.TOKEN);