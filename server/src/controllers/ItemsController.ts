import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
  async index (request: Request, response: Response) {
    const items = await knex('items').select('*');
  
    const serializedItems = items.map(item => {
      return { 
        titulo: item.titulo,
        imagem_url: `http://localhost:3333/uploads/${item.imagem}`
      };
    });
  
    return response.json(serializedItems);
  }
}

export default ItemsController;