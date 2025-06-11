import express from 'express';

import { HotelSearchController } from './hotelSearch.controller';

const hotelSearchRoutes = express.Router();
const hotelSearchController = new HotelSearchController();

hotelSearchRoutes.post('/suggestion', hotelSearchController.getHotelSuggestion);
hotelSearchRoutes.get('/hotel-plan', hotelSearchController.getAllHotelsPlan);
export default hotelSearchRoutes;
