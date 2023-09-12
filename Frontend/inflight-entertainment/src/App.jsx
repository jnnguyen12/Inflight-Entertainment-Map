"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logo = require("./logo.svg");
const react_1 = __importDefault(require("react"));
require("./App.css");
const LeafletMap_1 = require("./components/LeafletMap");
function App() {
    return (<div id="container">
        <LeafletMap_1.LeafletMap />
      </div>);
}
exports.default = App;
