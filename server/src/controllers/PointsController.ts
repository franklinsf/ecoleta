import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index (request: Request, response: Response) { 
    const { cidade, uf, items } = request.query;

    const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

    const points = await knex('points')
          .join('point_items', 'points.id', '=', 'point_items.point_id')
          .whereIn('item_id', parsedItems)
          .where('cidade', String(cidade))
          .where('uf', String(uf))
          .distinct()
          .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        ...point,
        imagem_url: `http://192.168.1.13:3333/uploads/${point.imagem}`
      };
    });

      return response.json(serializedPoints);
  }
  async show (request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point) {
      return response.status(400).json({ message: 'Point not found.' });
    }

    const serializedPoint = {
        ...point,
        imagem_url: `http://192.168.1.13:3333/uploads/${point.imagem}`
    };

    const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.titulo');

    return response.json({ point: serializedPoint, items });
  }

  async create (request: Request, response: Response) {
    const {
      nome,
      email,
      whatsapp,
      latitude,
      longitude,
      cidade,
      uf,
      items
    } = request.body;
    debugger;
    const trx = await knex.transaction();
    console.log('File: ', request.file);
    const point = {
      imagem: request.file.filename,
      nome,
      email,
      whatsapp,
      latitude,
      longitude,
      cidade,
      uf
    };
  
   const insertedIds = await trx('points').insert(point);
  
    const point_id = insertedIds[0];
  
    const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
      return {
        item_id,
        point_id
      };
    });
  
    await trx('point_items').insert(pointItems);

    await trx.commit();
  
    return response.json({ 
      id: point_id, 
      ...point,
    })
  }
}

export default PointsController;