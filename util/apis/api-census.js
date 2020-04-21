import axios from "axios";
import {
  logError,
  dbg
} from "../tools";

require("dotenv").config();

const apiURL = "https://api.census.gov/data/2019/"
const key = `&key=${process.env.APIKEY_CENSUS}`;

// export const getCountyPopulation = async (countyFIPS, stateFIPS) => {
//   const endpoint = `${apiURL}pep/population?get=POP&for=county:${countyFIPS}&in=state:${stateFIPS}${key}`;
//   axios.get(endpoint, response => {

//   })
// };

export const getAllCountyPopulations = async () => {
  const endpoint = `${apiURL}pep/population?get=POP&for=county:*${key}`;

  try {
    const response = axios.get(endpoint)
    console.log(response);
  } catch (err) {
    logError(`api-census::getAllCountyPopulations api call error: ${err}`);
  }

};