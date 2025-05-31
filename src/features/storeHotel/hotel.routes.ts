import express from 'express';

import { HotelImageController } from '../hotelImage/hotelImage.controller';
import { OrderRoomProductItemController } from '../orderRoomProductItem/orderRoomProductItem.controller';
import { RoomPlanController } from '../roomPlan/roomPlan.controller';

const hotelRoutes = express.Router();
const orderRoomProductItemController = new OrderRoomProductItemController();
const hotelImageController = new HotelImageController();
const roomPlanController = new RoomPlanController();

hotelRoutes.get('/:id/product-plans', orderRoomProductItemController.getByHotelProduct);
hotelRoutes.get('/:id/product-plans/:productId', orderRoomProductItemController.getByHotelProductItem);
hotelRoutes.get('/:id/images', hotelImageController.getHotelImages);
hotelRoutes.get('/room-plan/:id/detail', roomPlanController.getRoomPlanDetailById);

export default hotelRoutes;
