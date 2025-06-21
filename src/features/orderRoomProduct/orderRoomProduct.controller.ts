import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { QuerySchema } from '@/types/pagination';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';
import { SubscriptionService } from '@/utils/services/subscription.service';

import { OrderRoomProductItemRepo } from '../orderRoomProductItem/orderRoomProductItem.repo';
import { orderRoomProductWithItemsListDto } from '../orderRoomProductItem/orderRoomProductItem.schema';
import { ProductPlanRepo } from '../productPlan/productPlan.repo';
import { RoomPlanRepo } from '../roomPlan/roomPlan.repo';
import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { OrderRoomProductRepo } from './orderRoomProduct.repo';
import {
  orderRoomProductDto,
  orderRoomProductListDto,
  orderStoreQuerySchema,
  StatusType,
} from './orderRoomProduct.schema';
import { OrderRoomProductService } from './orderRoomProductService';

export class OrderRoomProductController {
  constructor(
    private orderRoomProductRepo = new OrderRoomProductRepo(),
    private roomPlanRepo = new RoomPlanRepo(),
    private subscriptionService = new SubscriptionService(),
    private storeHotelRepo = new StoreHotelRepo(),
    private productPlanRepo = new ProductPlanRepo(),
    private orderRoomProductItemRepo = new OrderRoomProductItemRepo(),
    private orderRoomProductService = new OrderRoomProductService(
      orderRoomProductRepo,
      roomPlanRepo,
      productPlanRepo,
      orderRoomProductItemRepo,
      storeHotelRepo,
      subscriptionService,
    ),
  ) {}
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = (req.user as JwtUserPayload).id;
    const status = req.query.status as StatusType;
    const { currentPage, perPage } = QuerySchema.parse(req.query);
    const result = await this.orderRoomProductRepo.getAll(userId, status, currentPage, perPage);

    const ordersWithItems = await Promise.all(
      result.orders.map(async (order) => {
        const itemResult = await this.orderRoomProductItemRepo.getByOrderId([order.id]);
        return {
          ...order,
          order_item: itemResult.souvenir[0] ?? null,
        };
      }),
    );

    const dtoData = orderRoomProductListDto.parse({
      orders: ordersWithItems,
      pagination: result.pagination,
    });

    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得訂房訂單列表成功'));
  });
  getAllByHotelId = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = (req.user as JwtUserPayload).id;

    const filters = orderStoreQuerySchema.parse(req.query);
    const result = await this.orderRoomProductRepo.getAllByHotelId(userId, filters);

    const ordersWithItems = await Promise.all(
      result.orders.map(async (order) => {
        const itemResult = await this.orderRoomProductItemRepo.getByOrderId([order.id]);
        return {
          ...order,
          order_item: itemResult.souvenir[0] ?? null,
        };
      }),
    );

    const dtoData = orderRoomProductListDto.parse({
      orders: ordersWithItems,
      pagination: result.pagination,
    });

    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得訂房訂單列表成功'));
  });
  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = res.locals;
    const id = req.params.id;
    const data = { ...req.body, user_id };
    await this.storeHotelRepo.getById({ hotelId: data.hotel_id });
    const result = await this.orderRoomProductRepo.getById(id, data.user_id);
    if (!result) {
      return next(appError('找不到對應的訂房訂單', HttpStatus.NOT_FOUND));
    }
    const dtoData = orderRoomProductDto.parse({ order: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得訂房訂單成功'));
  });
  create = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = res.locals;
    const data = { ...req.body, user_id };

    const result = await this.orderRoomProductService.createOrder(data);
    res.status(HttpStatus.CREATED).json(successResponse(result, '訂房訂單建立成功'));
  });
  updateOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = res.locals;
    const id = req.params.id;
    const data = { ...req.body, user_id, id };

    await this.storeHotelRepo.getById({ hotelId: data.hotel_id });
    const result = await this.orderRoomProductRepo.updateOrder(id, user_id, data);
    if (!result) {
      return next(appError('找不到對應的訂房訂單', HttpStatus.NOT_FOUND));
    }
    const dtoData = orderRoomProductDto.parse({ order: result });
    res.status(HttpStatus.OK).json(successResponse(dtoData, '訂房訂單狀態更新成功'));
  });
  getTotalOrderCountForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.orderRoomProductRepo.getTotalOrderCountForAdmin();

    res.status(HttpStatus.OK).json(successResponse({ count: result }, '取得訂房訂單總數成功'));
  });
  getAllForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as StatusType;
    const keyword = req.query.keyword as string | undefined;
    const { currentPage, perPage } = QuerySchema.parse(req.query);
    const result = await this.orderRoomProductRepo.getAllForAdmin(keyword, status, currentPage, perPage);

    const allOrderIds = result.orders.map((order) => order.id);
    const allItems = await this.orderRoomProductItemRepo.getByOrderId(allOrderIds);

    const itemsMap = new Map(allItems.souvenir.map((item) => [item.order_id, item]));

    const ordersWithItems = result.orders.map((order) => ({
      ...order,
      order_item: itemsMap.get(order.id) ?? null,
    }));

    const dtoData = orderRoomProductWithItemsListDto.parse({
      orders: ordersWithItems,
      pagination: result.pagination,
    });

    res.status(HttpStatus.OK).json(successResponse(dtoData, '取得訂房訂單列表成功'));
  });
}
